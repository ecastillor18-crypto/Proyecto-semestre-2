package com.fase1.proyecto.service;

import com.fase1.proyecto.exception.BusinessConflictException;
import com.fase1.proyecto.exception.ResourceNotFoundException;
import com.fase1.proyecto.modelos.Usuario;
import com.fase1.proyecto.repository.UsuarioRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    /**
     * POST (id == null): crea el usuario y encripta la contraseña con BCrypt.
     * PUT (id != null): actualiza los datos; si no llega contraseña conserva la anterior.
     */
    @Transactional
    public Usuario guardar(Usuario usuario) {
        if (usuario.getEmail() != null) {
            usuario.setEmail(usuario.getEmail().trim());
        }
        return usuario.getId() == null ? crear(usuario) : actualizar(usuario);
    }

    private Usuario crear(Usuario usuario) {
        if (usuario.getPasswordHash() == null || usuario.getPasswordHash().isBlank()) {
            throw new IllegalArgumentException("La contraseña es obligatoria");
        }
        if (usuario.getRol() == null || usuario.getRol().getId() == null) {
            throw new IllegalArgumentException("El rol es obligatorio");
        }
        if (usuarioRepository.existsByEmailIgnoreCase(usuario.getEmail())) {
            throw new BusinessConflictException("Ya existe un usuario con ese email");
        }
        usuario.setPasswordHash(passwordEncoder.encode(usuario.getPasswordHash()));
        if (usuario.getActivo() == null) {
            usuario.setActivo(true);
        }
        return usuarioRepository.save(usuario);
    }

    private Usuario actualizar(Usuario datos) {
        Usuario existente = usuarioRepository.findById(datos.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + datos.getId()));

        usuarioRepository.findByEmailIgnoreCase(datos.getEmail())
                .filter(otro -> !otro.getId().equals(existente.getId()))
                .ifPresent(otro -> {
                    throw new BusinessConflictException("Ya existe un usuario con ese email");
                });

        existente.setNombre(datos.getNombre());
        existente.setApellido(datos.getApellido());
        existente.setEmail(datos.getEmail());
        existente.setTelefono(datos.getTelefono());
        if (datos.getRol() != null && datos.getRol().getId() != null) {
            existente.setRol(datos.getRol());
        }
        if (datos.getActivo() != null) {
            existente.setActivo(datos.getActivo());
        }
        if (datos.getPasswordHash() != null && !datos.getPasswordHash().isBlank()) {
            existente.setPasswordHash(passwordEncoder.encode(datos.getPasswordHash()));
        }
        return usuarioRepository.save(existente);
    }

    public Optional<Usuario> buscarPorId(Integer id) {
        return usuarioRepository.findById(id);
    }

    public void eliminar(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario no encontrado: " + id);
        }
        try {
            usuarioRepository.deleteById(id);
            usuarioRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new BusinessConflictException(
                    "No se puede eliminar: el usuario tiene registros relacionados (médico o citas)");
        }
    }

    public boolean existe(Integer id) {
        return usuarioRepository.existsById(id);
    }
}
