package com.fase1.proyecto.service;

import com.fase1.proyecto.dto.cita.CitaCreateRequest;
import com.fase1.proyecto.dto.cita.CitaResponseDTO;
import com.fase1.proyecto.dto.cita.DiagnosticoRequest;
import com.fase1.proyecto.exception.BusinessRuleException;
import com.fase1.proyecto.exception.ResourceNotFoundException;
import com.fase1.proyecto.modelos.Cita;
import com.fase1.proyecto.modelos.Horario;
import com.fase1.proyecto.modelos.Medico;
import com.fase1.proyecto.modelos.Usuario;
import com.fase1.proyecto.repository.CitaRepository;
import com.fase1.proyecto.repository.HorarioRepository;
import com.fase1.proyecto.repository.MedicoRepository;
import com.fase1.proyecto.repository.UsuarioRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CitaService {

    private final CitaRepository citaRepository;
    private final HorarioRepository horarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final MedicoRepository medicoRepository;

    public CitaService(
            CitaRepository citaRepository,
            HorarioRepository horarioRepository,
            UsuarioRepository usuarioRepository,
            MedicoRepository medicoRepository) {
        this.citaRepository = citaRepository;
        this.horarioRepository = horarioRepository;
        this.usuarioRepository = usuarioRepository;
        this.medicoRepository = medicoRepository;
    }

    @Transactional(readOnly = true)
    public List<CitaResponseDTO> listar() {
        return citaRepository.findAllWithDetails().stream()
                .map(CitaResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<CitaResponseDTO> buscarPorId(Integer id) {
        return citaRepository.findByIdWithDetails(id)
                .map(CitaResponseDTO::fromEntity);
    }

    @Transactional
    public CitaResponseDTO reservar(Integer pacienteId, CitaCreateRequest request) {
        Usuario paciente = usuarioRepository.findByIdForUpdate(pacienteId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el paciente autenticado"));

        if (!Boolean.TRUE.equals(paciente.getActivo())) {
            throw new BusinessRuleException("El usuario está inactivo");
        }

        if (!"ROLE_PATIENT".equals(paciente.getRol().getNombreRol())) {
            throw new AccessDeniedException("Solo un paciente puede reservar una cita");
        }

        Horario horario = horarioRepository.findByIdForUpdate(request.getHorarioId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un horario con id " + request.getHorarioId()));

        validarHorarioReservable(horario);

        if (citaRepository.existsByHorario_IdAndEstado(horario.getId(), Cita.EstadoCita.PENDIENTE)) {
            throw new BusinessRuleException("El horario ya tiene una cita activa");
        }

        long crucesPaciente = citaRepository.countCrucesPaciente(
                pacienteId,
                Cita.EstadoCita.PENDIENTE,
                horario.getFecha(),
                horario.getHoraInicio(),
                horario.getHoraFin());

        if (crucesPaciente > 0) {
            throw new BusinessRuleException("El paciente ya tiene otra cita que se cruza con este horario");
        }

        horario.setEstado(Horario.EstadoHorario.RESERVADO);
        horarioRepository.save(horario);

        Cita cita = new Cita(
                paciente,
                horario.getMedico(),
                horario,
                request.getMotivo().trim());

        return CitaResponseDTO.fromEntity(citaRepository.save(cita));
    }

    @Transactional(readOnly = true)
    public List<CitaResponseDTO> listarPaciente(Integer pacienteId) {
        if (!usuarioRepository.existsById(pacienteId)) {
            throw new ResourceNotFoundException("No existe el paciente autenticado");
        }

        return citaRepository.findByPacienteWithDetails(pacienteId).stream()
                .map(CitaResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CitaResponseDTO> listarDoctor(Integer usuarioId, LocalDate fecha) {
        Medico medico = medicoRepository.findByUsuario_Id(usuarioId)
                .orElseThrow(() -> new AccessDeniedException("El usuario autenticado no tiene perfil de médico"));

        return citaRepository.findByMedicoWithDetails(medico.getId(), fecha).stream()
                .map(CitaResponseDTO::fromEntity)
                .toList();
    }

    @Transactional
    public CitaResponseDTO cancelar(Integer citaId, Integer usuarioId, boolean admin) {
        Cita cita = citaRepository.findByIdForUpdate(citaId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe una cita con id " + citaId));

        if (!admin && !cita.getPaciente().getId().equals(usuarioId)) {
            throw new AccessDeniedException("El paciente solo puede cancelar sus propias citas");
        }

        if (cita.getEstado() == Cita.EstadoCita.COMPLETADA) {
            throw new BusinessRuleException("Una cita completada no puede cancelarse");
        }

        if (cita.getEstado() == Cita.EstadoCita.CANCELADA) {
            return CitaResponseDTO.fromEntity(cita);
        }

        Horario horario = horarioRepository.findByIdForUpdate(cita.getHorario().getId())
                .orElseThrow(() -> new ResourceNotFoundException("No existe el horario asociado a la cita"));

        cita.setEstado(Cita.EstadoCita.CANCELADA);

        LocalDate hoy = LocalDate.now();
        LocalTime ahora = LocalTime.now();
        boolean reutilizable = horario.getFecha().isAfter(hoy)
                || (horario.getFecha().isEqual(hoy) && horario.getHoraInicio().isAfter(ahora));

        horario.setEstado(reutilizable
                ? Horario.EstadoHorario.DISPONIBLE
                : Horario.EstadoHorario.CANCELADO);

        horarioRepository.save(horario);
        return CitaResponseDTO.fromEntity(citaRepository.save(cita));
    }

    @Transactional
    public CitaResponseDTO registrarDiagnostico(
            Integer citaId,
            Integer usuarioId,
            boolean admin,
            DiagnosticoRequest request) {
        Cita cita = citaRepository.findByIdForUpdate(citaId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe una cita con id " + citaId));

        validarMedicoDeCita(cita, usuarioId, admin);

        if (cita.getEstado() == Cita.EstadoCita.CANCELADA) {
            throw new BusinessRuleException("Una cita cancelada no puede recibir diagnóstico");
        }

        validarCitaYaIniciada(cita);
        cita.setDiagnostico(request.getDiagnostico().trim());
        cita.setReceta(request.getReceta() == null || request.getReceta().isBlank()
                ? null : request.getReceta().trim());
        cita.setEstado(Cita.EstadoCita.COMPLETADA);
        return CitaResponseDTO.fromEntity(citaRepository.save(cita));
    }

    @Transactional
    public CitaResponseDTO completar(Integer citaId, Integer usuarioId, boolean admin) {
        Cita cita = citaRepository.findByIdForUpdate(citaId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe una cita con id " + citaId));

        validarMedicoDeCita(cita, usuarioId, admin);

        if (cita.getEstado() == Cita.EstadoCita.CANCELADA) {
            throw new BusinessRuleException("Una cita cancelada no puede completarse");
        }

        validarCitaYaIniciada(cita);

        cita.setEstado(Cita.EstadoCita.COMPLETADA);
        return CitaResponseDTO.fromEntity(citaRepository.save(cita));
    }

    private void validarMedicoDeCita(Cita cita, Integer usuarioId, boolean admin) {
        if (admin) return;
        Medico medico = medicoRepository.findByUsuario_Id(usuarioId)
                .orElseThrow(() -> new AccessDeniedException("El usuario autenticado no tiene perfil de médico"));
        if (!cita.getMedico().getId().equals(medico.getId())) {
            throw new AccessDeniedException("El médico solo puede atender sus propias citas");
        }
    }

    private void validarCitaYaIniciada(Cita cita) {
        LocalDate hoy = LocalDate.now();
        LocalTime ahora = LocalTime.now();
        boolean aunNoInicia = cita.getHorario().getFecha().isAfter(hoy)
                || (cita.getHorario().getFecha().isEqual(hoy)
                && cita.getHorario().getHoraInicio().isAfter(ahora));
        if (aunNoInicia) {
            throw new BusinessRuleException("La cita no puede completarse antes de la hora programada");
        }
    }

    private void validarHorarioReservable(Horario horario) {
        if (horario.getEstado() != Horario.EstadoHorario.DISPONIBLE) {
            throw new BusinessRuleException("El horario no está disponible");
        }

        LocalDate hoy = LocalDate.now();
        LocalTime ahora = LocalTime.now();
        if (horario.getFecha().isBefore(hoy)
                || (horario.getFecha().isEqual(hoy) && !horario.getHoraInicio().isAfter(ahora))) {
            throw new BusinessRuleException("No se puede reservar un horario que ya inició o está en el pasado");
        }
    }
}
