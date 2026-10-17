package com.fase1.proyecto;

import com.fase1.proyecto.dto.horario.HorarioRequestDTO;
import com.fase1.proyecto.dto.horario.HorarioResponseDTO;
import com.fase1.proyecto.exception.BusinessRuleException;
import com.fase1.proyecto.modelos.Medico;
import com.fase1.proyecto.modelos.Rol;
import com.fase1.proyecto.modelos.Usuario;
import com.fase1.proyecto.repository.HorarioRepository;
import com.fase1.proyecto.repository.MedicoRepository;
import com.fase1.proyecto.service.HorarioService;
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
class HorarioServiceTest {

    @Mock
    private HorarioRepository horarioRepository;

    @Mock
    private MedicoRepository medicoRepository;

    private HorarioService horarioService;
    private HorarioRequestDTO request;
    private Medico medico;

    @BeforeEach
    void setUp() {
        horarioService = new HorarioService(horarioRepository, medicoRepository);

        Rol rol = new Rol("ROLE_DOCTOR", "Médico");
        Usuario usuario = new Usuario("María", "López", "doctor@test.local", "hash", null, rol);
        usuario.setId(10);

        medico = new Medico(usuario, "COL-001", 5, "Perfil");
        medico.setId(1);

        request = new HorarioRequestDTO();
        request.setMedicoId(1);
        request.setFecha(LocalDate.now().plusDays(5));
        request.setHoraInicio(LocalTime.of(9, 0));
        request.setHoraFin(LocalTime.of(10, 0));
    }

    @Test
    void creaHorarioValido() {
        when(medicoRepository.findByIdForUpdate(1)).thenReturn(Optional.of(medico));
        when(horarioRepository.countCruces(any(), any(), any(), any(), any(), any())).thenReturn(0L);
        when(horarioRepository.save(any())).thenAnswer(invocation -> {
            var horario = invocation.getArgument(0, com.fase1.proyecto.modelos.Horario.class);
            horario.setId(20);
            return horario;
        });

        HorarioResponseDTO response = horarioService.crear(request, 99, true);

        assertEquals(20, response.getId());
        assertEquals("DISPONIBLE", response.getEstado());
    }

    @Test
    void rechazaCruceDeHorario() {
        when(medicoRepository.findByIdForUpdate(1)).thenReturn(Optional.of(medico));
        when(horarioRepository.countCruces(any(), any(), any(), any(), any(), any())).thenReturn(1L);

        assertThrows(BusinessRuleException.class, () -> horarioService.crear(request, 99, true));
    }
}
