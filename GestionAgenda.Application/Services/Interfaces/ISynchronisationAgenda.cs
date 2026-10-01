namespace GestionAgenda.Application.Services.Interfaces;

public interface ISynchronisationAgenda
{
    void DemandeModifiee(Guid demandeId);

    void IndisponibiliteModifiee(Guid indisponibiliteId);

    void IndisponibiliteSupprimee(Guid indisponibiliteId, Guid dirigeantId);
}
