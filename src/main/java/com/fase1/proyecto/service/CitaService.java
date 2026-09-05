package com.fase1.proyecto.service;

import com.fase1.proyecto.dto.CitaRequestDTO;
import com.fase1.proyecto.exception.BusinessConflictException;
import com.fase1.proyecto.exception.ResourceNotFoundException;
import com.fase1.proyecto.modelos.Cita;
import com.fase1.proyecto.modelos.Horario;
import com.fase1.proyecto.repository.CitaRepository;
import com.fase1.proyecto.repository.HorarioRepository;
import com.fase1.proyecto.repository.MedicoRepository;
import com.fase1.proyecto.repository.UsuarioRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
public class CitaService {

    private final CitaRepository citaRepository;
    private final UsuarioRepository usuarioRepository;
    private final MedicoRepository medicoRepository;
    private final HorarioRepository horarioRepository;

    public CitaService(
            CitaRepository citaRepository,
            UsuarioRepository usuarioRepository,
            MedicoRepository medicoRepository,
            HorarioRepository horarioRepository) {
        this.citaRepository = citaRepository;
        this.usuarioRepository = usuarioRepository;
        this.medicoRepository = medicoRepository;
        this.horarioRepository = horarioRepository;
    }

    public List<Cita> listar() {
        return citaRepository.findAll();
    }

    public Cita guardar(Cita cita) {
        return citaRepository.save(cita);
    }

    @Transactional
    public Cita reservar(CitaRequestDTO request) {
        var paciente = usuarioRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un paciente con id " + request.getPacienteId()));
        var medico = medicoRepository.findById(request.getMedicoId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un médico con id " + request.getMedicoId()));
        Horario horario = horarioRepository.findByIdForUpdate(request.getHorarioId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un horario con id " + request.getHorarioId()));

        if (horario.getMedico().getId() == null
                || !horario.getMedico().getId().equals(medico.getId())) {
            throw new BusinessConflictException("El horario no pertenece al médico seleccionado");
        }
        if (horario.getEstado() != Horario.EstadoHorario.DISPONIBLE) {
            throw new BusinessConflictException("El horario seleccionado ya no está disponible");
        }

        horario.setEstado(Horario.EstadoHorario.RESERVADO);
        horarioRepository.save(horario);
        return citaRepository.save(new Cita(paciente, medico, horario, request.getMotivo().trim()));
    }

    public Optional<Cita> buscarPorId(Integer id) {
        return citaRepository.findById(id);
    }

    public void eliminar(Integer id) {
        citaRepository.deleteById(id);
    }

    public boolean existe(Integer id) {
        return citaRepository.existsById(id);
    }
}