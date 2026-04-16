// Este código maneja eventos de grupo, no comandos directos de texto.
// Idealmente se coloca en tu manejador de eventos (groupUpdate o similar).

export default {
    name: 'admin-protection',
    category: 'admin',
    run: async (client, anu) => {
        try {
            const { id, participants, action, author } = anu;
            
            // Ignorar si el autor es el propio bot o si no hay autor (acciones del sistema)
            const botNumber = client.user.id.split(':')[0] + '@s.whatsapp.net';
            if (!author || author === botNumber) return;

            // Obtener datos del grupo
            const metadata = await client.groupMetadata(id);
            const isBotAdmin = metadata.participants.find(p => p.id === botNumber)?.admin;
            
            // Si el bot no es admin, no puede hacer nada
            if (!isBotAdmin) return;

            // 1. DETECCIÓN DE QUITAR ADMIN (DEMOTE)
            if (action === 'demote') {
                for (let user of participants) {
                    // Si el autor NO es el dueño del grupo y le quitó el admin a alguien
                    if (author !== metadata.owner) {
                        
                        let warning = `📻 *RADIO ALASTOR: ALERTA DE SUBLEVACIÓN* 🎙️\n\n`;
                        warning += `Parece que @${author.split('@')[0]} está intentando jugar con el poder.\n\n`;
                        warning += `> *Acción:* Intento de degradación.\n`;
                        warning += `> *Estado:* Eliminando al traidor de mi sintonía... ♪`;

                        // 1. Sacamos al responsable
                        await client.groupParticipantsUpdate(id, [author], 'remove');
                        
                        // 2. Le devolvemos el admin a la víctima
                        await client.groupParticipantsUpdate(id, [user], 'promote');

                        await client.sendMessage(id, { 
                            text: warning, 
                            mentions: [author, user] 
                        });
                    }
                }
            }

            // 2. DETECCIÓN DE ELIMINAR MIEMBROS (REMOVE)
            if (action === 'remove') {
                for (let user of participants) {
                    // Si el autor sacó a alguien y no es el dueño (Protección básica)
                    // Nota: Aquí podrías filtrar para que solo proteja si el 'user' era admin
                    if (author !== user && author !== metadata.owner) {
                        
                        let report = `🎙️ *ANUNCIO DE ÚLTIMA HORA* 📻\n\n`;
                        report += `@${author.split('@')[0]} ha osado expulsar a alguien sin mi permiso.\n\n`;
                        report += `> _¡El espectáculo debe continuar, pero sin ti!_`;

                        await client.groupParticipantsUpdate(id, [author], 'remove');
                        
                        await client.sendMessage(id, { 
                            text: report, 
                            mentions: [author] 
                        });
                    }
                }
            }

        } catch (error) {
            console.error('Error en protección de grupo:', error);
        }
    }
};
