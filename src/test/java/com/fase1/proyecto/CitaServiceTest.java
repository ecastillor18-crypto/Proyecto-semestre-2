package com.fase1.proyecto;

import com.fase1.proyecto.dto.cita.CitaCreateRequest;
import com.fase1.proyecto.dto.cita.CitaResponseDTO;
import com.fase1.proyecto.exception.BusinessRuleException;
import com.fase1.proyecto.modelos.Cita;
import com.fase1.proyecto.modelos.Horario;
import com.fase1.proyecto.modelos.Medico;
import com.fase1.proyecto.modelos.Rol;
import com.fase1.proyecto.modelos.Usuario;
import com.fase1.proyecto.repository.CitaRepository;
import com.fase1.proyecto.repository.HorarioRepository;
import com.fase1.proyecto.repository.MedicoRepository;
import com.fase1.proyecto.repository.UsuarioRepository;
import com.fase1.proyecto.service.CitaService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CitaServiceTest {

    @Mock
    private CitaRepository citaRepository;

    @Mock
    private HorarioRepository horarioRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private MedicoRepository medicoRepository;

    private CitaService citaService;
    private Usuario paciente;
    private Horario horario;
    private CitaCreateRequest request;

    @BeforeEach
    void setUp() {
        citaService = new CitaService(citaRepository, horarioRepository, usuarioRepository, medicoRepository);

        Rol patientRole = new Rol("ROLE_PATIENT", "Paciente");
        paciente = new Usuario("Paciente", "Demo", "paciente@test.local", "hash", null, patientRole);
        paciente.setId(3);
        paciente.setActivo(true);

        Rol doctorRole = new Rol("ROLE_DOCTOR", "Médico");
        Usuario doctorUser = new Usuario("María", "López", "doctor@test.local", "hash", null, doctorRole);
        doctorUser.setId(2);

        Medico medico = new Medico(doctorUser, "COL-001", 5, "Perfil");
        medico.setId(1);

        horario = new Horario(
                medico,
                LocalDate.now().plusDays(5),
                LocalTime.of(9, 0),
                LocalTime.of(10, 0));
        horario.setId(15);

        request = new CitaCreateRequest();
        request.setHorarioId(15);
        request.setMotivo("Consulta médica general");
    }

    @Test
    void reservaHorarioDisponible() {
        when(usuarioRepository.findByIdForUpdate(3)).thenReturn(Optional.of(paciente));
        when(horarioRepository.findByIdForUpdate(15)).thenReturn(Optional.of(horario));
        when(citaRepository.existsByHorario_IdAndEstado(15, Cita.EstadoCita.PENDIENTE)).thenReturn(false);
        when(citaRepository.countCrucesPaciente(any(), any(), any(), any(), any())).thenReturn(0L);
        when(horarioRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(citaRepository.save(any())).thenAnswer(invocation -> {
            Cita cita = invocation.getArgument(0, Cita.class);
            cita.setId(50);
            return cita;
        });

        CitaResponseDTO response = citaService.reservar(3, request);

        assertEquals(50, response.getId());
        assertEquals("PENDIENTE", response.getEstado());
        assertEquals(Horario.EstadoHorario.RESERVADO, horario.getEstado());
    }

    @Test
    void rechazaHorarioReservado() {
        horario.setEstado(Horario.EstadoHorario.RESERVADO);
        when(usuarioRepository.findByIdForUpdate(3)).thenReturn(Optional.of(paciente));
        when(horarioRepository.findByIdForUpdate(15)).thenReturn(Optional.of(horario));

        assertThrows(BusinessRuleException.class, () -> citaService.reservar(3, request));
    }
}
