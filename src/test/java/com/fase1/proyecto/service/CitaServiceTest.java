package com.fase1.proyecto.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fase1.proyecto.dto.CitaRequestDTO;
import com.fase1.proyecto.exception.BusinessConflictException;
import com.fase1.proyecto.modelos.Cita;
import com.fase1.proyecto.modelos.Horario;
import com.fase1.proyecto.modelos.Medico;
import com.fase1.proyecto.modelos.Usuario;
import com.fase1.proyecto.repository.CitaRepository;
import com.fase1.proyecto.repository.HorarioRepository;
import com.fase1.proyecto.repository.MedicoRepository;
import com.fase1.proyecto.repository.UsuarioRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CitaServiceTest {

    @Mock
    private CitaRepository citaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private MedicoRepository medicoRepository;

    @Mock
    private HorarioRepository horarioRepository;

    private CitaService citaService;
    private Usuario paciente;
    private Medico medico;
    private Horario horario;

    @BeforeEach
    void setUp() {
        citaService = new CitaService(citaRepository, usuarioRepository, medicoRepository, horarioRepository);
        paciente = new Usuario();
        paciente.setId(1);
        medico = new Medico();
        medico.setId(2);
        horario = new Horario(medico, LocalDate.now().plusDays(1), LocalTime.of(9, 0), LocalTime.of(10, 0));
        horario.setId(10);
    }

    @Test
    void reservaUnHorarioDisponibleYLoMarcaComoReservado() {
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(paciente));
        when(medicoRepository.findById(2)).thenReturn(Optional.of(medico));
        when(horarioRepository.findByIdForUpdate(10)).thenReturn(Optional.of(horario));
        when(citaRepository.save(any(Cita.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Cita cita = citaService.reservar(request());

        assertEquals(Horario.EstadoHorario.RESERVADO, horario.getEstado());
        assertEquals("Consulta", cita.getMotivo());
        verify(horarioRepository).save(horario);
        verify(citaRepository).save(any(Cita.class));
    }

    @Test
    void rechazaUnHorarioNoDisponible() {
        horario.setEstado(Horario.EstadoHorario.RESERVADO);
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(paciente));
        when(medicoRepository.findById(2)).thenReturn(Optional.of(medico));
        when(horarioRepository.findByIdForUpdate(10)).thenReturn(Optional.of(horario));

        assertThrows(BusinessConflictException.class, () -> citaService.reservar(request()));

        verify(citaRepository, never()).save(any(Cita.class));
    }

    private CitaRequestDTO request() {
        CitaRequestDTO request = new CitaRequestDTO();
        request.setPacienteId(1);
        request.setMedicoId(2);
        request.setHorarioId(10);
        request.setMotivo(" Consulta ");
        return request;
    }
}