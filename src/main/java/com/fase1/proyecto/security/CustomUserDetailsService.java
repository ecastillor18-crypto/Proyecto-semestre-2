package com.fase1.proyecto.security;

import com.fase1.proyecto.modelos.Usuario;
import com.fase1.proyecto.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Credenciales inválidas"));

        if (usuario.getRol() == null || usuario.getRol().getNombreRol() == null) {
            throw new UsernameNotFoundException("El usuario no tiene un rol válido");
        }

        return User.withUsername(usuario.getEmail())
                .password(usuario.getPasswordHash())
                .authorities(usuario.getRol().getNombreRol())
                .disabled(!Boolean.TRUE.equals(usuario.getActivo()))
                .build();
    }
}
