self.addEventListener('push', (event) => {
  const charge = event.data ? event.data.json() : { titre: 'Gestion Agenda', message: '' };
  event.waitUntil(self.registration.showNotification(charge.titre, { body: charge.message }));
});
