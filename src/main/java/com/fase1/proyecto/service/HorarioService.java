package com.fase1.proyecto.service;

import com.fase1.proyecto.dto.horario.HorarioRequestDTO;
import com.fase1.proyecto.dto.horario.HorarioResponseDTO;
import com.fase1.proyecto.exception.BusinessRuleException;
import com.fase1.proyecto.exception.ResourceNotFoundException;
import com.fase1.proyecto.modelos.Horario;
import com.fase1.proyecto.modelos.Medico;
import com.fase1.proyecto.repository.HorarioRepository;
import com.fase1.proyecto.repository.MedicoRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HorarioService {

    private final HorarioRepository horarioRepository;
    private final MedicoRepository medicoRepository;

    public HorarioService(HorarioRepository horarioRepository, MedicoRepository medicoRepository) {
        this.horarioRepository = horarioRepository;
        this.medicoRepository = medicoRepository;
    }

    @Transactional(readOnly = true)
    public List<HorarioResponseDTO> listar() {
        return horarioRepository.findAllWithDetails().stream()
                .map(HorarioResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Horario> buscarDisponibles(Integer medicoId, LocalDate fecha) {
        if (medicoId != null && !medicoRepository.existsById(medicoId)) {
            throw new ResourceNotFoundException("No existe un médico con id " + medicoId);
        }

        LocalDate hoy = LocalDate.now();
        LocalTime ahora = LocalTime.now();

        if (fecha != null && fecha.isBefore(hoy)) {
            return List.of();
        }

        Horario.EstadoHorario disponible = Horario.EstadoHorario.DISPONIBLE;
        List<Horario> horarios;

        if (medicoId != null && fecha != null) {
            horarios = horarioRepository.findByEstadoAndMedico_IdAndFechaOrderByHoraInicioAsc(
                    disponible, medicoId, fecha);
        } else if (medicoId != null) {
            horarios = horarioRepository.findByEstadoAndMedico_IdOrderByFechaAscHoraInicioAsc(
                    disponible, medicoId);
        } else if (fecha != null) {
            horarios = horarioRepository.findByEstadoAndFechaOrderByHoraInicioAsc(disponible, fecha);
        } else {
            horarios = horarioRepository.findByEstadoOrderByFechaAscHoraInicioAsc(disponible);
        }

        return horarios.stream()
                .filter(h -> h.getFecha().isAfter(hoy)
                        || (h.getFecha().isEqual(hoy) && h.getHoraInicio().isAfter(ahora)))
                .sorted(Comparator.comparing(Horario::getFecha).thenComparing(Horario::getHoraInicio))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HorarioResponseDTO> listarGestion(
            Integer usuarioId,
            boolean admin,
            Integer medicoId,
            LocalDate fecha) {
        Integer medicoFiltro = medicoId;
        if (!admin) {
            Medico propio = medicoRepository.findByUsuario_Id(usuarioId)
                    .orElseThrow(() -> new AccessDeniedException("El usuario autenticado no tiene perfil de médico"));
            if (medicoId != null && !propio.getId().equals(medicoId)) {
                throw new AccessDeniedException("Un médico solo puede consultar su propia agenda");
            }
            medicoFiltro = propio.getId();
        } else if (medicoId != null && !medicoRepository.existsById(medicoId)) {
            throw new ResourceNotFoundException("No existe un médico con id " + medicoId);
        }

        return horarioRepository.findForManagement(medicoFiltro, fecha).stream()
                .map(HorarioResponseDTO::fromEntity)
                .toList();
    }

    @Transactional
    public HorarioResponseDTO crear(
            HorarioRequestDTO request,
            Integer usuarioId,
            boolean admin) {
        Medico medico = obtenerMedicoAutorizado(request.getMedicoId(), usuarioId, admin);
        validarRango(request.getFecha(), request.getHoraInicio(), request.getHoraFin());

        Optional<Horario> existente = horarioRepository.findByMedico_IdAndFechaAndHoraInicio(
                medico.getId(), request.getFecha(), request.getHoraInicio());

        if (existente.isPresent() && existente.get().getEstado() == Horario.EstadoHorario.CANCELADO) {
            Horario horario = existente.get();
            validarCruce(
                    medico.getId(),
                    request.getFecha(),
                    request.getHoraInicio(),
                    request.getHoraFin(),
                    horario.getId());
            horario.setHoraFin(request.getHoraFin());
            horario.setEstado(Horario.EstadoHorario.DISPONIBLE);
            return HorarioResponseDTO.fromEntity(horarioRepository.save(horario));
        }

        validarCruce(medico.getId(), request.getFecha(), request.getHoraInicio(), request.getHoraFin(), null);

        Horario horario = new Horario(
                medico,
                request.getFecha(),
                request.getHoraInicio(),
                request.getHoraFin());

        return HorarioResponseDTO.fromEntity(horarioRepository.save(horario));
    }

    @Transactional
    public HorarioResponseDTO actualizar(
            Integer horarioId,
            HorarioRequestDTO request,
            Integer usuarioId,
            boolean admin) {
        Horario horario = horarioRepository.findByIdForUpdate(horarioId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un horario con id " + horarioId));

        if (horario.getEstado() == Horario.EstadoHorario.RESERVADO) {
            throw new BusinessRuleException("No se puede modificar un horario que ya está reservado");
        }

        validarPropietarioMedico(horario.getMedico().getId(), usuarioId, admin);
        Medico medico = obtenerMedicoAutorizado(request.getMedicoId(), usuarioId, admin);
        validarRango(request.getFecha(), request.getHoraInicio(), request.getHoraFin());
        validarCruce(
                medico.getId(),
                request.getFecha(),
                request.getHoraInicio(),
                request.getHoraFin(),
                horarioId);

        horario.setMedico(medico);
        horario.setFecha(request.getFecha());
        horario.setHoraInicio(request.getHoraInicio());
        horario.setHoraFin(request.getHoraFin());
        horario.setEstado(Horario.EstadoHorario.DISPONIBLE);

        return HorarioResponseDTO.fromEntity(horarioRepository.save(horario));
    }

    @Transactional
    public HorarioResponseDTO cancelar(Integer horarioId, Integer usuarioId, boolean admin) {
        Horario horario = horarioRepository.findByIdForUpdate(horarioId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un horario con id " + horarioId));

        validarPropietarioMedico(horario.getMedico().getId(), usuarioId, admin);

        if (horario.getEstado() == Horario.EstadoHorario.RESERVADO) {
            throw new BusinessRuleException("El horario tiene una cita activa y no puede cancelarse directamente");
        }

        horario.setEstado(Horario.EstadoHorario.CANCELADO);
        return HorarioResponseDTO.fromEntity(horarioRepository.save(horario));
    }

    @Transactional(readOnly = true)
    public Optional<HorarioResponseDTO> buscarPorId(Integer id) {
        return horarioRepository.findByIdWithDetails(id)
                .map(HorarioResponseDTO::fromEntity);
    }

    private Medico obtenerMedicoAutorizado(Integer medicoId, Integer usuarioId, boolean admin) {
        Medico medico = medicoRepository.findByIdForUpdate(medicoId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un médico con id " + medicoId));
        validarPropietarioMedico(medicoId, usuarioId, admin);
        return medico;
    }

    private void validarPropietarioMedico(Integer medicoId, Integer usuarioId, boolean admin) {
        if (admin) {
            return;
        }

        Medico propio = medicoRepository.findByUsuario_Id(usuarioId)
                .orElseThrow(() -> new AccessDeniedException("El usuario autenticado no tiene perfil de médico"));

        if (!propio.getId().equals(medicoId)) {
            throw new AccessDeniedException("Un médico solo puede administrar sus propios horarios");
        }
    }

    private void validarRango(LocalDate fecha, LocalTime horaInicio, LocalTime horaFin) {
        if (!horaInicio.isBefore(horaFin)) {
            throw new BusinessRuleException("La hora de inicio debe ser anterior a la hora de fin");
        }

        LocalDate hoy = LocalDate.now();
        if (fecha.isBefore(hoy)) {
            throw new BusinessRuleException("No se pueden crear horarios en fechas pasadas");
        }

        if (fecha.isEqual(hoy) && !horaInicio.isAfter(LocalTime.now())) {
            throw new BusinessRuleException("La hora de inicio debe estar en el futuro");
        }
    }

    private void validarCruce(
            Integer medicoId,
            LocalDate fecha,
            LocalTime horaInicio,
            LocalTime horaFin,
            Integer excludeId) {
        long cruces = horarioRepository.countCruces(
                medicoId,
                fecha,
                horaInicio,
                horaFin,
                excludeId,
                Horario.EstadoHorario.CANCELADO);

        if (cruces > 0) {
            throw new BusinessRuleException("El horario se cruza con otro horario activo del médico");
        }
    }
}
