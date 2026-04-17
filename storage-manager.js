/** Storage Manager
 * Handles: localStorage (collection + theme), sessionStorage (tracking), cookies (name)
 */
console.log('[StorageManager] Loaded successfully.');

const PokemonApp = {
// ── 1. COLLECTION ────────────────────────────────────────────────────────
    collection: {
        getKey: function() {
            // Always read trainer name from Cookie ONLY (never localStorage)
            // Cookie is the single source of truth for active trainer
            var currentTrainer = '';
            var value = "; " + document.cookie;
            var parts = value.split("; trainerName=");
            if (parts.length === 2) {
                currentTrainer = decodeURIComponent(parts.pop().split(";").shift());
            }
            if (currentTrainer && currentTrainer !== '') {
                return 'pokemonDeck_' + currentTrainer;
            }
            return 'pokemonDeck';
        },

        getAll: function () {
            try {
                return JSON.parse(localStorage.getItem(this.getKey())) || [];
            } catch (e) {
                return [];
            }
        },

        addSilent: function (card) {
            var list = this.getAll();
            if (list.some(function (item) { return item.id === card.id; })) {
                return false; 
            }
            list.push({
                id:      card.id,
                name:    card.name,
                image:   card.image  || '',
                type:    card.type   || 'Unknown',
                rarity:  card.rarity || 'Unknown',
                addedAt: new Date().toLocaleDateString()
            });
            localStorage.setItem(this.getKey(), JSON.stringify(list));
            return true;
        },

        remove: function (index) {
            var list = this.getAll();
            list.splice(index, 1);
  
            localStorage.setItem(this.getKey(), JSON.stringify(list));
        },

        removeById: function (id) {
            var list = this.getAll().filter(function (item) { return item.id !== id; });

            localStorage.setItem(this.getKey(), JSON.stringify(list));
        },

        has: function (id) {
            return this.getAll().some(function (item) { return item.id === id; });
        }
    },
    // ── 2. THEME  (localStorage key: 'siteTheme') ────────────────────────
    theme: {
        key: 'siteTheme',

        apply: function () {
            var saved = localStorage.getItem(this.key) || 'light';
            $('html').attr('data-bs-theme', saved);
            this._updateBtn(saved);
        },

        toggle: function () {
            var current = $('html').attr('data-bs-theme') || 'light';
            var next    = current === 'dark' ? 'light' : 'dark';
            $('html').attr('data-bs-theme', next);
            localStorage.setItem(this.key, next);
            this._updateBtn(next);
        },

        _updateBtn: function (theme) {
            var $btn = $('#theme-toggle');
            if (!$btn.length) return;
            if (theme === 'dark') {
                $btn.removeClass('btn-dark btn-outline-dark')
                    .addClass('btn-light')
                    .html('&#9728;&#65039; Light Mode');
            } else {
                $btn.removeClass('btn-light')
                    .addClass('btn-dark')
                    .html('&#127769; Dark Mode');
            }
        },

        // CSS to inject — only called on Bootstrap pages that use data-bs-theme
        injectCSS: function () {
            var css = [
                '[data-bs-theme="light"] body { background-color:#f8f9fa !important; color:#212529 !important; transition:background-color 0.3s; }',
                '[data-bs-theme="dark"]  body { background-color:#121212 !important; color:#ffffff !important; transition:background-color 0.3s; }',
                '[data-bs-theme="dark"] .text-muted { color:#bbbbbb !important; }',
                '[data-bs-theme="dark"] .card { background-color:#1e1e1e !important; border-color:#333 !important; color:#fff !important; }',
                '[data-bs-theme="dark"] .card .text-muted { color:#aaa !important; }',
                '[data-bs-theme="dark"] .card .card-title { color:#fff !important; }'
            ].join('\n');
            var tag = document.createElement('style');
            tag.id  = 'sm-theme-css';
            tag.innerHTML = css;
            document.head.appendChild(tag);
        }
    },

    // ── 3. SESSION TRACKER  (sessionStorage) ─────────────────────────────
    session: {
        markVisited: function () {
            if (!sessionStorage.getItem('hasVisited')) {
                sessionStorage.setItem('hasVisited', 'true');
            }
        }
    }
};

// ── Auto-init ─────────────────────────────────────────────────────────────
$(document).ready(function () {

    if ($('#theme-toggle').length) {
        // Bootstrap-themed pages: index, my-collection, how-to-play …
        PokemonApp.theme.injectCSS();
        PokemonApp.theme.apply();

        $('#theme-toggle').on('click', function () {
            PokemonApp.theme.toggle();
        });
    }

    PokemonApp.session.markVisited();
});