package com.fase1.proyecto.service;

import com.fase1.proyecto.modelos.Especialidad;
import com.fase1.proyecto.repository.EspecialidadRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class EspecialidadService {

    private final EspecialidadRepository especialidadRepository;

    public EspecialidadService(EspecialidadRepository especialidadRepository) {
        this.especialidadRepository = especialidadRepository;
    }

    public List<Especialidad> listar() {
        return especialidadRepository.findAll();
    }

    public Especialidad guardar(Especialidad especialidad) {
        return especialidadRepository.save(especialidad);
    }

    public Optional<Especialidad> buscarPorId(Integer id) {
        return especialidadRepository.findById(id);
    }

    public void eliminar(Integer id) {
        especialidadRepository.deleteById(id);
    }

    public boolean existe(Integer id) {
        return especialidadRepository.existsById(id);
    }
}