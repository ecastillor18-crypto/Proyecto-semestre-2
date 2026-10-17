package com.fase1.proyecto.service;

import com.fase1.proyecto.dto.usuario.UsuarioAdminRequest;
import com.fase1.proyecto.dto.usuario.UsuarioResponseDTO;
import com.fase1.proyecto.exception.BusinessRuleException;
import com.fase1.proyecto.exception.ResourceNotFoundException;
import com.fase1.proyecto.modelos.Rol;
import com.fase1.proyecto.modelos.Usuario;
import com.fase1.proyecto.repository.RolRepository;
import com.fase1.proyecto.repository.UsuarioRepository;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listar() {
        return usuarioRepository.findAllWithRole().stream()
                .map(UsuarioResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(Integer id) {
        Usuario usuario = usuarioRepository.findByIdWithRole(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un usuario con id " + id));
        return UsuarioResponseDTO.fromEntity(usuario);
    }

    @Transactional
    public UsuarioResponseDTO crear(UsuarioAdminRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessRuleException("Ya existe un usuario con ese email");
        }
        if (request.getPassword() == null || request.getPassword().isBlank() || request.getPassword().length() < 8) {
            throw new BusinessRuleException("La contraseña es obligatoria y debe tener al menos 8 caracteres");
        }

        Rol rol = obtenerRol(request.getRolId());
        Usuario usuario = new Usuario();
        aplicarDatos(usuario, request, rol);
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        return UsuarioResponseDTO.fromEntity(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponseDTO actualizar(Integer id, UsuarioAdminRequest request) {
        Usuario usuario = usuarioRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un usuario con id " + id));

        String email = request.getEmail().trim().toLowerCase();
        usuarioRepository.findByEmailIgnoreCase(email).ifPresent(existente -> {
            if (!existente.getId().equals(id)) {
                throw new BusinessRuleException("Ya existe otro usuario con ese email");
            }
        });

        Rol rol = obtenerRol(request.getRolId());
        aplicarDatos(usuario, request, rol);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (request.getPassword().length() < 8) {
                throw new BusinessRuleException("La contraseña debe tener al menos 8 caracteres");
            }
            usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        return UsuarioResponseDTO.fromEntity(usuarioRepository.save(usuario));
    }

    @Transactional
    public void eliminar(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("No existe un usuario con id " + id);
        }
        usuarioRepository.deleteById(id);
    }

    public boolean existe(Integer id) {
        return usuarioRepository.existsById(id);
    }

    private Rol obtenerRol(Integer rolId) {
        return rolRepository.findById(rolId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un rol con id " + rolId));
    }

    private void aplicarDatos(Usuario usuario, UsuarioAdminRequest request, Rol rol) {
        usuario.setNombre(request.getNombre().trim());
        usuario.setApellido(request.getApellido().trim());
        usuario.setEmail(request.getEmail().trim().toLowerCase());
        usuario.setTelefono(normalizarOpcional(request.getTelefono()));
        usuario.setRol(rol);
        usuario.setActivo(request.getActivo() == null ? true : request.getActivo());
    }

    private String normalizarOpcional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
