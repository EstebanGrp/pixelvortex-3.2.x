(function() {
    const CONFIG_URL = "https://raw.githubusercontent.com/EstebanGrp/pixelvortex-3.2.x/refs/heads/main/pixelvortexcontrol.json";
    
    const RankSystem = {
        config: null,
        currentUser: null,

        async init() {
            console.log("%c[RankSystem] Iniciando v1.1...", "color: #9b59ff; font-weight: bold;");
            await this.fetchConfig();
            
            // Fallback local por si falla el fetch o para pruebas rápidas
            if (!this.config) {
                console.warn("[RankSystem] Usando configuración de emergencia (fallback)");
                this.config = {
                    ranks: {
                        pixelvortex: { id: "pixelvortex", prefix: "[PixelVortex]", style: { color: "#2227bd", bold: true, glow: true } },
                        admin: { id: "admin", prefix: "[ADMIN]", style: { color: "#ff3b3b", bold: true, glow: true } },
                        user: { id: "user", prefix: "", style: { color: "#ffffff", bold: false, glow: false } }
                    },
                    users: [
                        { username: "EstebanGrp_", rank: "pixelvortex" },
                        { username: "Wolf_Shadow_Wolf", rank: "pixelvortex" },
                        { username: "Wolf_Esteban_GRPWolf", rank: "pixelvortex" }
                    ],
                    global: { maintenance: false }
                };
            }

            this.checkMaintenance();
            this.setupObserver();
            this.injectStyles();
            
            console.log("[RankSystem] Sistema listo. Usuarios monitoreados:", this.config.users.length);
        },

        async fetchConfig() {
            try {
                const response = await fetch(CONFIG_URL + "?t=" + Date.now());
                if (!response.ok) throw new Error("HTTP " + response.status);
                this.config = await response.json();
                console.log("[RankSystem] Configuración cargada desde GitHub");
            } catch (e) {
                console.error("[RankSystem] Error cargando configuración remota:", e.message);
            }
        },

        checkMaintenance() {
            if (this.config && this.config.global && this.config.global.maintenance) {
                document.body.innerHTML = '<div style="background:#1a1a1a;color:white;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;"><h1 style="color:#ff3b3b;">Mantenimiento</h1><p style="font-size:1.2em;">' + this.config.global.maintenance_message + '</p><div style="margin-top:20px;color:#888;">Pixel Vortex ' + this.config.meta.version + '</div></div>';
            }
        },

        injectStyles() {
            var style = document.createElement('style');
            var css = '.pv-rank { margin-right: 5px; font-weight: bold; }.pv-glow { text-shadow: 0 0 8px currentColor; }.pv-bold { font-weight: 900 !important; }';

            if (this.config && this.config.ranks) {
                for (var rankId in this.config.ranks) {
                    var rank = this.config.ranks[rankId];
                    css += '.pv-rank-' + rankId + ' { color: ' + rank.style.color + ' !important; }';
                }
            }

            style.textContent = css;
            document.head.appendChild(style);
        },

        getRankData(rankId) {
            if (!this.config || !this.config.ranks) return { id: "user", prefix: "", style: { color: "#ffffff", bold: false, glow: false } };
            return this.config.ranks[rankId] || this.config.ranks.user;
        },

        setupObserver() {
            var self = this;
            var observer = new MutationObserver(function(mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    var addedNodes = mutations[i].addedNodes;
                    for (var j = 0; j < addedNodes.length; j++) {
                        var node = addedNodes[j];
                        if (node.nodeType === 1) { // ELEMENT_NODE
                            self.processNode(node);
                            var children = node.getElementsByTagName('*');
                            for (var k = 0; k < children.length; k++) {
                                self.processNode(children[k]);
                            }
                        }
                    }
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
            
            // Escaneo inicial agresivo
            setTimeout(function() {
                var all = document.getElementsByTagName('*');
                for (var i = 0; i < all.length; i++) {
                    self.processNode(all[i]);
                }
            }, 2000);
        },

        processNode(node) {
            if (!node || !node.textContent || node.dataset.rankProcessed) return;

            var text = node.textContent;
            var users = this.config.users;

            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                // Regex más flexible para detectar el nombre incluso con niveles (46) o en el TAB
                var escapedName = user.username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                var nameRegex = new RegExp("(^|\\s|\\(|\\d)" + escapedName + "(\\s|:|\\)|$)", "i");

                if (nameRegex.test(text)) {
                    // Si el nodo tiene muchos hijos, no queremos arruinarlo, 
                    // buscamos el nodo de texto específico o el span más pequeño
                    if (node.children.length > 0 && node.tagName !== 'SPAN') {
                        continue; 
                    }
                    this.applyRankToNode(node, user);
                    break;
                }
            }
        },

        applyRankToNode(node, userData) {
            const rank = this.getRankData(userData.rank);
            if (!rank || !rank.prefix) {
                node.dataset.rankProcessed = "true";
                return;
            }

            // Evitar procesar múltiples veces
            node.dataset.rankProcessed = "true";

            const prefixSpan = document.createElement('span');
            prefixSpan.className = `pv-rank pv-rank-${rank.id} ${rank.style.glow ? 'pv-glow' : ''} ${rank.style.bold ? 'pv-bold' : ''}`;
            prefixSpan.textContent = rank.prefix + " ";

            // Si el nodo tiene hijos, insertamos al principio
            if (node.firstChild) {
                node.insertBefore(prefixSpan, node.firstChild);
            } else {
                node.appendChild(prefixSpan);
            }

            // Aplicar color al nombre también si es necesario
            if (rank.style.color) {
                node.style.color = rank.style.color;
            }
        }
    };

    window.RankSystem = RankSystem;
    RankSystem.init();
})();
