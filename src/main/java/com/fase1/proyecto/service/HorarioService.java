package com.fase1.proyecto.service;

import com.fase1.proyecto.exception.ResourceNotFoundException;
import com.fase1.proyecto.modelos.Horario;
import com.fase1.proyecto.repository.HorarioRepository;
import com.fase1.proyecto.repository.MedicoRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class HorarioService {

    private final HorarioRepository horarioRepository;
    private final MedicoRepository medicoRepository;

    public HorarioService(HorarioRepository horarioRepository, MedicoRepository medicoRepository) {
        this.horarioRepository = horarioRepository;
        this.medicoRepository = medicoRepository;
    }

    public List<Horario> listar() {
        return horarioRepository.findAll();
    }

    /**
     * Busca horarios en estado disponible, filtrando opcionalmente por médico o fecha
     * Usado por GET /api/v1/scheduls/available?medicoId=&fecha=
     */
    public List<Horario> buscarDisponibles(Integer medicoId, LocalDate fecha) {
        if (medicoId != null && !medicoRepository.existsById(medicoId)) {
            throw new ResourceNotFoundException("No existe un medico con id " + medicoId);
        }

        Horario.EstadoHorario disponible = Horario.EstadoHorario.DISPONIBLE;

        if (medicoId != null && fecha != null) {
            return horarioRepository.findByEstadoAndMedico_IdAndFecha(disponible, medicoId, fecha);
        }
        if (medicoId != null) {
            return horarioRepository.findByEstadoAndMedico_Id(disponible, medicoId);
        }
        if (fecha != null) {
            return horarioRepository.findByEstadoAndFecha(disponible, fecha);
        }
        return horarioRepository.findByEstado(disponible);
    }

    public Horario guardar(Horario horario) {
        return horarioRepository.save(horario);
    }

    public Optional<Horario> buscarPorId(Integer id) {
        return horarioRepository.findById(id);
    }

    public void eliminar(Integer id) {
        horarioRepository.deleteById(id);
    }

    public boolean existe(Integer id) {
        return horarioRepository.existsById(id);
    }
}