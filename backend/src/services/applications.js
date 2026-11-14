// Règles métier des candidatures et des avis (pures, testables)

export const STATUTS = ['a_postuler', 'envoyee', 'entretien', 'acceptee', 'refusee'];

export const isValidStatut = (value) => STATUTS.includes(value);

/**
 * Un avis est « vérifié » : seul un étudiant dont une candidature a été acceptée
 * chez cette entreprise peut en déposer un.
 */
export function hasAcceptedApplication(userId, companyId, applications, offers) {
  return applications.some((a) => {
    if (a.userId !== userId || a.statut !== 'acceptee') return false;
    const offer = offers.find((o) => o.id === a.offerId);
    return offer?.companyId === companyId;
  });
}

/** Un étudiant ne peut déposer qu'un seul avis par entreprise. */
export function hasReviewed(userId, companyId, reviews) {
  return reviews.some((r) => r.userId === userId && r.companyId === companyId);
}
