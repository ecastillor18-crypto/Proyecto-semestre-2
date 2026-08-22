package com.fase1.proyecto.service;

import com.fase1.proyecto.modelos.Rol;
import com.fase1.proyecto.repository.RolRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class RolService {

    private final RolRepository rolRepository;

    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    public List<Rol> listar() {
        return rolRepository.findAll();
    }

    public Rol guardar(Rol rol) {
        return rolRepository.save(rol);
    }

    public Optional<Rol> buscarPorId(Integer id) {
        return rolRepository.findById(id);
    }

    public void eliminar(Integer id) {
        rolRepository.deleteById(id);
    }

    public boolean existe(Integer id) {
        return rolRepository.existsById(id);
    }
}