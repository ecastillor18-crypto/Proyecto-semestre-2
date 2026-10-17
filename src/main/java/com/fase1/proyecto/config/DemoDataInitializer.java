package com.fase1.proyecto.config;

import com.fase1.proyecto.modelos.Especialidad;
import com.fase1.proyecto.modelos.Horario;
import com.fase1.proyecto.modelos.Medico;
import com.fase1.proyecto.modelos.Rol;
import com.fase1.proyecto.modelos.Usuario;
import com.fase1.proyecto.repository.EspecialidadRepository;
import com.fase1.proyecto.repository.HorarioRepository;
import com.fase1.proyecto.repository.MedicoRepository;
import com.fase1.proyecto.repository.RolRepository;
import com.fase1.proyecto.repository.UsuarioRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@ConditionalOnProperty(name = "app.demo-data.enabled", havingValue = "true", matchIfMissing = true)
public class DemoDataInitializer {

    @Bean
    public CommandLineRunner cargarDatosDemo(
            RolRepository rolRepository,
            UsuarioRepository usuarioRepository,
            EspecialidadRepository especialidadRepository,
            MedicoRepository medicoRepository,
            HorarioRepository horarioRepository,
            PasswordEncoder passwordEncoder) {

        return args -> inicializar(
                rolRepository,
                usuarioRepository,
                especialidadRepository,
                medicoRepository,
                horarioRepository,
                passwordEncoder);
    }

    void inicializar(
            RolRepository rolRepository,
            UsuarioRepository usuarioRepository,
            EspecialidadRepository especialidadRepository,
            MedicoRepository medicoRepository,
            HorarioRepository horarioRepository,
            PasswordEncoder passwordEncoder) {

        Rol admin = obtenerOCrearRol(rolRepository, "ROLE_ADMIN", "Administrador del sistema");
        Rol doctorRole = obtenerOCrearRol(rolRepository, "ROLE_DOCTOR", "Médico");
        Rol patientRole = obtenerOCrearRol(rolRepository, "ROLE_PATIENT", "Paciente");

        obtenerOCrearUsuario(
                usuarioRepository, passwordEncoder,
                "Admin", "Demo", "admin@citas.local", "Admin123!", "55550001", admin);

        Usuario doctorUser = obtenerOCrearUsuario(
                usuarioRepository, passwordEncoder,
                "María", "López", "doctor@citas.local", "Doctor123!", "55550002", doctorRole);

        obtenerOCrearUsuario(
                usuarioRepository, passwordEncoder,
                "Paciente", "Demo", "paciente@citas.local", "Paciente123!", "55550003", patientRole);

        Especialidad medicinaGeneral = especialidadRepository.findByNombreIgnoreCase("Medicina General")
                .orElseGet(() -> especialidadRepository.save(
                        new Especialidad("Medicina General", "Atención médica general")));

        Medico medico = medicoRepository.findByUsuario_Id(doctorUser.getId())
                .orElseGet(() -> {
                    Medico nuevo = new Medico(
                            doctorUser,
                            "COL-DEMO-001",
                            5,
                            "Médico de demostración para pruebas locales");
                    nuevo.setEspecialidades(Set.of(medicinaGeneral));
                    return medicoRepository.save(nuevo);
                });

        if (medico.getEspecialidades().stream().noneMatch(e -> e.getId().equals(medicinaGeneral.getId()))) {
            medico.getEspecialidades().add(medicinaGeneral);
            medicoRepository.save(medico);
        }

        LocalDate fechaDemo = LocalDate.now().plusDays(1);
        crearHorarioSiNoExiste(horarioRepository, medico, fechaDemo, LocalTime.of(9, 0), LocalTime.of(10, 0));
        crearHorarioSiNoExiste(horarioRepository, medico, fechaDemo, LocalTime.of(10, 0), LocalTime.of(11, 0));
    }

    private Rol obtenerOCrearRol(RolRepository repository, String nombre, String descripcion) {
        return repository.findByNombreRol(nombre)
                .orElseGet(() -> repository.save(new Rol(nombre, descripcion)));
    }

    private Usuario obtenerOCrearUsuario(
            UsuarioRepository repository,
            PasswordEncoder encoder,
            String nombre,
            String apellido,
            String email,
            String password,
            String telefono,
            Rol rol) {
        return repository.findByEmailIgnoreCase(email)
                .orElseGet(() -> repository.save(
                        new Usuario(nombre, apellido, email, encoder.encode(password), telefono, rol)));
    }

    private void crearHorarioSiNoExiste(
            HorarioRepository repository,
            Medico medico,
            LocalDate fecha,
            LocalTime inicio,
            LocalTime fin) {
        if (!repository.existsByMedico_IdAndFechaAndHoraInicio(medico.getId(), fecha, inicio)) {
            repository.save(new Horario(medico, fecha, inicio, fin));
        }
    }
}
