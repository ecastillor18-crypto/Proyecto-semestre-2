package com.fase1.proyecto.service;

import com.fase1.proyecto.modelos.Cita;
import com.fase1.proyecto.repository.CitaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class CitaService {

    private final CitaRepository citaRepository;

    public CitaService(CitaRepository citaRepository) {
        this.citaRepository = citaRepository;
    }

    public List<Cita> listar() {
        return citaRepository.findAll();
    }

    public Cita guardar(Cita cita) {
        return citaRepository.save(cita);
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