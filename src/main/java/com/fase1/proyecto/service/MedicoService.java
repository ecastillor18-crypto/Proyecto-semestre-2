package com.fase1.proyecto.service;

import com.fase1.proyecto.exception.ResourceNotFoundException;
import com.fase1.proyecto.modelos.Medico;
import com.fase1.proyecto.repository.EspecialidadRepository;
import com.fase1.proyecto.repository.MedicoRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class MedicoService {

    private final MedicoRepository medicoRepository;
    private final EspecialidadRepository especialidadRepository;

    public MedicoService(MedicoRepository medicoRepository, EspecialidadRepository especialidadRepository) {
        this.medicoRepository = medicoRepository;
        this.especialidadRepository = especialidadRepository;
    }

    public List<Medico> listar() {
        return medicoRepository.findAll();
    }

    /** filtro de medicos por espacialidad
     * Usado por GET /api/v1/doctors?especialidadId=
     */
    public List<Medico> listar(Integer especialidadId) {
        if (especialidadId == null) {
            return medicoRepository.findAll();
        }
        if (!especialidadRepository.existsById(especialidadId)) {
            throw new ResourceNotFoundException("No existe una especialidad con id " + especialidadId);
        }
        return medicoRepository.findByEspecialidadId(especialidadId);
    }

    public Medico guardar(Medico medico) {
        return medicoRepository.save(medico);
    }

    public Optional<Medico> buscarPorId(Integer id) {
        return medicoRepository.findById(id);
    }

    public void eliminar(Integer id) {
        medicoRepository.deleteById(id);
    }

    public boolean existe(Integer id) {
        return medicoRepository.existsById(id);
    }
}