import fs from 'fs';
import path from 'path';

export default {
    command: ['limpiar', 'clear', 'optimizar'],
    category: 'owner', // Solo tú deberías poder limpiar el sistema
    run: async (sock, m, { usedPrefix, command }) => {
        // Solo el dueño puede ejecutar limpieza profunda
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isOwner = [botJid, ...global.owner].some(jid => m.sender.includes(jid));
        
        if (!isOwner) return m.reply('🎙️ RADIO ALASTOR: Solo el dueño de la estación puede limpiar los escombros. ♪');

        let report = '🎙️ *RADIO ALASTOR: MANTENIMIENTO EN VIVO* 📻\n\n';
        
        // 1. Carpetas a limpiar
        const foldersToClean = [
            './tmp',             // Archivos temporales (imágenes/videos procesados)
            './Sessions/Subs',   // Sesiones de subbots antiguas
        ];

        let archivosBorrados = 0;

        foldersToClean.forEach(folder => {
            if (fs.existsSync(folder)) {
                const files = fs.readdirSync(folder);
                files.forEach(file => {
                    try {
                        const filePath = path.join(folder, file);
                        // Evitar borrar el archivo de sesión principal
                        if (!file.includes('creds.json') && !file.includes('session')) {
                            fs.unlinkSync(filePath);
                            archivosBorrados++;
                        }
                    } catch (e) {
                        // Error silencioso si un archivo está en uso
                    }
                });
                report += `✅ Carpeta *${folder}* purgada.\n`;
            }
        });

        // 2. Limpieza de Logs pesados
        const logFile = './yarn-error.log'; 
        if (fs.existsSync(logFile)) {
            fs.unlinkSync(logFile);
            report += `✅ Errores de Yarn eliminados.\n`;
            archivosBorrados++;
        }

        // 3. Forzar recolector de basura (si está disponible)
        if (global.gc) {
            global.gc();
            report += `✅ Memoria RAM optimizada manualmente.\n`;
        }

        if (archivosBorrados === 0) {
            return m.reply('📻 La señal está limpia, querido. No hay archivos basura que eliminar por ahora.');
        }

        report += `\n📊 Total de archivos purgados: *${archivosBorrados}*\n\n> El bot ahora debería responder con mayor fluidez. ♪`;
        
        await sock.sendMessage(m.chat, { text: report }, { quoted: m });
    }
};
