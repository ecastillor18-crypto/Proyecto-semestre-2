package com.fase1.proyecto.service;

import com.fase1.proyecto.dto.medico.MedicoAdminRequest;
import com.fase1.proyecto.dto.medico.MedicoAdminResponse;
import com.fase1.proyecto.exception.BusinessRuleException;
import com.fase1.proyecto.exception.ResourceNotFoundException;
import com.fase1.proyecto.modelos.Especialidad;
import com.fase1.proyecto.modelos.Medico;
import com.fase1.proyecto.modelos.Usuario;
import com.fase1.proyecto.repository.EspecialidadRepository;
import com.fase1.proyecto.repository.MedicoRepository;
import com.fase1.proyecto.repository.UsuarioRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MedicoService {

    private final MedicoRepository medicoRepository;
    private final EspecialidadRepository especialidadRepository;
    private final UsuarioRepository usuarioRepository;

    public MedicoService(MedicoRepository medicoRepository, EspecialidadRepository especialidadRepository,
            UsuarioRepository usuarioRepository) {
        this.medicoRepository = medicoRepository;
        this.especialidadRepository = especialidadRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<Medico> listar() { return medicoRepository.findAllWithDetails(); }

    @Transactional(readOnly = true)
    public List<Medico> listar(Integer especialidadId) {
        if (especialidadId == null) return medicoRepository.findAllWithDetails();
        if (!especialidadRepository.existsById(especialidadId)) {
            throw new ResourceNotFoundException("No existe una especialidad con id " + especialidadId);
        }
        return medicoRepository.findByEspecialidadId(especialidadId);
    }

    @Transactional(readOnly = true)
    public List<MedicoAdminResponse> listarAdmin() {
        return medicoRepository.findAllWithDetails().stream().map(MedicoAdminResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public MedicoAdminResponse buscarAdmin(Integer id) {
        return MedicoAdminResponse.fromEntity(medicoRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un médico con id " + id)));
    }

    @Transactional(readOnly = true)
    public Medico obtenerPorUsuario(Integer usuarioId) {
        return medicoRepository.findByUsuario_Id(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("El usuario autenticado no tiene perfil de médico"));
    }

    @Transactional
    public MedicoAdminResponse crear(MedicoAdminRequest request) {
        if (medicoRepository.findByUsuario_Id(request.getUsuarioId()).isPresent()) {
            throw new BusinessRuleException("Ese usuario ya tiene un perfil de médico");
        }
        Medico medico = new Medico();
        aplicar(medico, request);
        return MedicoAdminResponse.fromEntity(medicoRepository.save(medico));
    }

    @Transactional
    public MedicoAdminResponse actualizar(Integer id, MedicoAdminRequest request) {
        Medico medico = medicoRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un médico con id " + id));
        medicoRepository.findByUsuario_Id(request.getUsuarioId()).ifPresent(otro -> {
            if (!otro.getId().equals(id)) throw new BusinessRuleException("Ese usuario ya pertenece a otro médico");
        });
        aplicar(medico, request);
        return MedicoAdminResponse.fromEntity(medicoRepository.save(medico));
    }

    @Transactional
    public void eliminar(Integer id) {
        if (!medicoRepository.existsById(id)) throw new ResourceNotFoundException("No existe un médico con id " + id);
        medicoRepository.deleteById(id);
    }

    private void aplicar(Medico medico, MedicoAdminRequest request) {
        Usuario usuario = usuarioRepository.findByIdWithRole(request.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("No existe un usuario con id " + request.getUsuarioId()));
        if (!"ROLE_DOCTOR".equals(usuario.getRol().getNombreRol())) {
            throw new BusinessRuleException("El usuario seleccionado debe tener ROLE_DOCTOR");
        }
        Set<Integer> ids = request.getEspecialidadIds() == null ? Set.of() : request.getEspecialidadIds();
        List<Especialidad> encontrados = especialidadRepository.findAllById(ids);
        if (encontrados.size() != ids.size()) throw new ResourceNotFoundException("Una o más especialidades no existen");
        medico.setUsuario(usuario);
        medico.setNumeroColegiado(request.getNumeroColegiado().trim());
        medico.setAniosExperiencia(request.getAniosExperiencia());
        medico.setBiografia(request.getBiografia() == null || request.getBiografia().isBlank() ? null : request.getBiografia().trim());
        medico.setEspecialidades(new HashSet<>(encontrados));
    }
}
