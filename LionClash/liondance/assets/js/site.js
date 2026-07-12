// site.js — cakie
(function () {
    'use strict';

    var INTERNAL_PAGES = {
        'index.html': true,
        'menu.html': true,
        'products.html': true,
        'services.html': true,
        'privacy-policy.html': true,
        'job-details.html': true,
        'service-details.html': true,
        'product-details.html': true
    };

    var HOME_HASH = {
        '#hero-section': true,
        '#aboutus-section': true,
        '#process-section': true,
        '#awards-section': true,
        '#testimonials-section': true,
        '#career-section': true,
        '#footer-section': true
    };

    var ABOUT_HEAD = { about: 1, 'about-section': 1, aboutus: 1, 'about-us': 1, 'about-us-section': 1 };

    function lastPathSeg(path) {
        var s = String(path || '').replace(/\\/g, '/').replace(/^\.\//, '').split('?')[0];
        return (s.split('/').filter(Boolean).pop() || s).toLowerCase();
    }

    function pathBaseName(pathNorm) {
        return lastPathSeg(pathNorm).replace(/\.html?$/i, '');
    }

    function hasQueryId(pathWithQuery) {
        var m = String(pathWithQuery || '').match(/[?&]id=([^&]*)/i);
        if (!m) return false;
        try {
            return decodeURIComponent(String(m[1]).replace(/\+/g, ' ')).trim() !== '';
        } catch (e) {
            return String(m[1] || '').trim() !== '';
        }
    }

    function normalizeAboutHash(frag) {
        if (!frag || frag.charAt(0) !== '#') return frag;
        var amp = frag.indexOf('&');
        var head = (amp === -1 ? frag.slice(1) : frag.slice(1, amp)).toLowerCase();
        var tail = amp === -1 ? '' : frag.slice(amp);
        return ABOUT_HEAD[head] ? '#aboutus-section' + tail : frag;
    }

    function hashToListPage(frag) {
        if (!frag || frag.charAt(0) !== '#') return '';
        var core = String(frag.slice(1).split('&')[0]).toLowerCase().replace(/-section$/, '');
        if (core === 'services' || core === 'service') return 'services.html';
        if (core === 'products' || core === 'product' || core === 'menu') return 'products.html';
        return '';
    }

    function homeHashKey(frag) {
        if (!frag || frag.charAt(0) !== '#') return '';
        return '#' + frag.slice(1).split('&')[0].toLowerCase();
    }

    function resolveNavUrl(url, basePage) {
        if (!url || url === '#') return url;
        basePage = basePage || 'index.html';

        var u = String(url).trim();
        if (/^https?:\/\//i.test(u)) return u;

        var hashIdx = u.indexOf('#');
        var fragment = hashIdx >= 0 ? u.slice(hashIdx) : '';
        fragment = normalizeAboutHash(fragment);
        if (hashIdx >= 0) u = u.slice(0, hashIdx) + fragment;

        var listFromHash = hashToListPage(fragment);
        if (listFromHash) return listFromHash;

        var hk = homeHashKey(fragment);
        if (hk && HOME_HASH[hk]) return 'index.html' + fragment;

        var pathOnly = hashIdx >= 0 ? u.slice(0, hashIdx) : u;
        var pl = lastPathSeg(pathOnly);

        if (pl === 'services' || pl === 'service' || pl === 'services.html') return 'services.html';
        if (/^(products|product|menu)(\.html)?$/i.test(pl)) return 'products.html';

        var base = pathBaseName(pl);
        if (!hasQueryId(pathOnly)) {
            if (base === 'service-details' || base === 'service-detail') return 'services.html' + fragment;
            if (base === 'product-details' || base === 'product-detail') return 'products.html' + fragment;
            if (base === 'job-details' || base === 'job-detail') return 'index.html#career-section';
        }

        if (u.charAt(0) === '#') {
            var loc = window.location.pathname || '';
            var onHome = /index\.html?$/i.test(loc) || loc === '/' || loc === '';
            if (!onHome) return basePage + u;
        }

        if (pathOnly && pathOnly.charAt(0) !== '/' && pathOnly.charAt(0) !== '#') {
            var pq = pathOnly.split('?')[0];
            if (!/\.[a-z0-9]+$/i.test(pq)) return pq + '.html' + fragment;
        }

        return u;
    }

    function isKnownInternalNavTarget(url, basePage) {
        if (!url || url === '#') return false;
        if (/^(?:https?:|mailto:|tel:)/i.test(url)) return true;
        if (/^javascript:/i.test(url)) return false;

        var u = String(url).trim();
        if (u === '/' || u === '') return true;

        var hashIdx = u.indexOf('#');
        var hash = hashIdx >= 0 ? u.slice(hashIdx).toLowerCase() : '';
        var pathOnly = hashIdx >= 0 ? u.slice(0, hashIdx) : u;
        var pathNorm = pathOnly.replace(/^\.\//, '').split('?')[0].replace(/\\/g, '/');
        var page = pathNorm.split('/').filter(Boolean).pop() || '';
        var base = String(basePage || 'index.html').toLowerCase();

        if (u.charAt(0) === '#') return !!HOME_HASH[hash];
        if (!page && hash) return !!HOME_HASH[hash];

        if (pathOnly && pathOnly.charAt(0) === '/') return true;

        var pageLower = page.toLowerCase();
        var hasHtml = /\.html?$/i.test(pageLower);
        if (hasHtml) {
            if (!hash) return true;
            if (pageLower === base) return !!HOME_HASH[hash];
            return true;
        }

        if (!INTERNAL_PAGES[pageLower]) return false;
        if (!hash) return true;
        if (pageLower === base) return !!HOME_HASH[hash];
        return true;
    }

    function setNavLink(a, url, basePage) {
        var href = resolveNavUrl(url, basePage);
        var ok = isKnownInternalNavTarget(href, basePage);
        a.href = ok ? href : 'javascript:void(0)';
        if (!ok) {
            a.setAttribute('aria-disabled', 'true');
            a.addEventListener('click', function (e) { e.preventDefault(); });
        }
    }

    function order(a, b) {
        return ((a.displayOrder || a.DisplayOrder) || 0) - ((b.displayOrder || b.DisplayOrder) || 0);
    }

    function navClass(url) {
        return 'nav-' + (url || '').replace(/^#/, '').replace(/-section$/, '');
    }

    function absUrl(u) {
        if (!u) return '';
        if (/^https?:\/\//i.test(u)) return u;
        if (u.charAt(0) === '/') return window.location.origin + u;
        return u;
    }

    function faviconMimeType(url) {
        var x = String(url || '').toLowerCase();
        if (x.indexOf('.png') !== -1) return 'image/png';
        if (x.indexOf('.svg') !== -1) return 'image/svg+xml';
        if (x.indexOf('.jpg') !== -1 || x.indexOf('.jpeg') !== -1) return 'image/jpeg';
        return 'image/x-icon';
    }

    function renderCompany(company, basePage) {
        if (!company) return;
        var name = company.companyName || company.CompanyName || '';
        var logoURL = company.logoURL || company.LogoURL || '';
        var fav = company.faviconURL || company.FaviconURL || '';
        var copyright = company.copyright || company.Copyright || '';
        var tagline =
            company.tagline ||
            company.Tagline ||
            company.companyTagline ||
            company.CompanyTagline ||
            company.footerTagline ||
            company.FooterTagline ||
            '';
        var regNo =
            company.RegisterNumber ||
            company.registerNumber ||
            company.RegistrationNumber ||
            company.registrationNumber ||
            '';

        if (name) {
            document.querySelectorAll('.about-title').forEach(function (el) {
                if (el.querySelector && el.querySelector('img')) return;
                el.textContent = name;
            });
        }

        var logoEl = document.querySelector('header .logo');
        if (logoEl && logoURL) {
            logoEl.innerHTML = '';
            var img = document.createElement('img');
            img.src = absUrl(logoURL);
            img.alt = name || 'Logo';
            img.className = 'header-logo-img';
            logoEl.appendChild(img);
        } else if (logoEl && name) {
            logoEl.textContent = name;
        }

        if (fav) {
            var favUrl = absUrl(fav);
            var link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.type = faviconMimeType(favUrl);
            link.href = favUrl;

            var shortcut = document.querySelector('link[rel="shortcut icon"]');
            if (!shortcut) {
                shortcut = document.createElement('link');
                shortcut.rel = 'shortcut icon';
                document.head.appendChild(shortcut);
            }
            shortcut.type = link.type;
            shortcut.href = favUrl;
        }

        if (tagline) {
            document.querySelectorAll('.footer-section.footer-logo p').forEach(function (el) {
                el.textContent = tagline;
            });
        }

        var regEl = document.getElementById('businessno');
        if (regEl && regNo) regEl.textContent = regNo;

        var cp = document.getElementById('copyright-text');
        if (cp) {
            if (copyright) {
                var cpText = copyright;
                if (regNo && cpText.toLowerCase().indexOf(String(regNo).toLowerCase()) === -1) {
                    cpText += ' ' + regNo;
                }
                cp.textContent = cpText;
            } else if (regNo && cp.textContent.toLowerCase().indexOf(String(regNo).toLowerCase()) === -1) {
                cp.textContent = (cp.textContent || '').trim() + ' ' + regNo;
            }
        }

        if (name && !document.querySelector('meta[name="cakie-title-skip"]')) {
            var path = window.location.pathname || '';
            var isHome = /index\.html?$/i.test(path) || path === '/' || path === '';
            if (isHome) document.title = name;
        }
    }

    function renderContact(c) {
        if (!c) return;
        var email = c.ContactEmail || c.contactEmail;
        var el = document.getElementById('contact-email');
        if (el && email) {
            el.href = 'mailto:' + email;
            el.innerHTML =
                '<span class="contact-email-label">Email: </span>' +
                '<span class="contact-email-address">' + escHtml(email) + '</span>';
        }
        var phone = c.ContactPhone || c.contactPhone;
        if (phone) setText('contact-contact1', 'Phone: ' + phone);
        var fax = c.ContactFax || c.contactFax;
        var c2 = document.getElementById('contact-contact2');
        if (c2 && fax) {
            c2.textContent = 'Fax: ' + fax;
            c2.style.display = '';
        }
        var o1 = c.MainOfficeAddress || c.mainOfficeAddress;
        var o2 = c.SalesOfficeAddress || c.salesOfficeAddress;
        if (o1) {
            setAddr('contact-office1', o1);
            show('main-office-wrapper', true);
        }
        if (o2) {
            setAddr('contact-office2', o2);
            show('sales-office-wrapper', true);
        }
        var linkedin = c.LinkedInURL || c.linkedInURL || c.LinkedinURL || c.linkedinURL;
        var fb = c.FacebookURL || c.facebookURL;
        if (linkedin) setHref('social-linkedin', linkedin);
        if (fb) setHref('social-facebook', fb);
    }

    function renderMainNav(navItems, ctaItems, basePage) {
        var nav = document.getElementById('main-nav-top');
        if (!nav || !navItems || !navItems.length) return;

        var sorted = navItems.slice().sort(order);
        var childMap = {};
        sorted.forEach(function (item) {
            var pid = item.parentID || item.ParentID;
            if (pid) {
                if (!childMap[pid]) childMap[pid] = [];
                childMap[pid].push(item);
            }
        });

        var topItems = sorted.filter(function (item) {
            return !(item.parentID || item.ParentID);
        });

        nav.innerHTML = '';

        topItems.forEach(function (item) {
            var id = item.navID || item.navId || '';
            var label = item.label || '';
            var rawUrl = item.externalURL || '#';
            var children = (childMap[id] || []).slice().sort(order);

            if (children.length) {
                var wrap = document.createElement('div');
                wrap.className = 'nav-dropdown';
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'nav-dropdown-trigger';
                btn.setAttribute('aria-expanded', 'false');
                btn.setAttribute('aria-haspopup', 'true');
                btn.innerHTML = escHtml(label) + ' <i class="fas fa-chevron-down"></i>';
                var menu = document.createElement('div');
                menu.className = 'nav-dropdown-menu';
                menu.setAttribute('hidden', '');
                children.forEach(function (ch) {
                    var a = document.createElement('a');
                    setNavLink(a, ch.externalURL || '#', basePage);
                    a.textContent = ch.label || '';
                    menu.appendChild(a);
                });
                wrap.appendChild(btn);
                wrap.appendChild(menu);
                nav.appendChild(wrap);
            } else {
                var a = document.createElement('a');
                setNavLink(a, rawUrl, basePage);
                a.className = navClass(rawUrl) + ' module-link';
                a.textContent = label;
                nav.appendChild(a);
            }
        });

        renderCTA(ctaItems, basePage, nav);
    }

    function renderCTA(ctaItems, basePage, nav) {
        if (!ctaItems || !ctaItems.length) return;
        var c = ctaItems[0];
        var label = c.label || c.Label || '';
        var btn = document.getElementById('cta-button');
        if (!btn) {
            btn = document.createElement('a');
            btn.id = 'cta-button';
            nav.appendChild(btn);
        }
        if (label) btn.textContent = label;
        setNavLink(btn, c.externalURL || c.ExternalURL || '#footer-section', basePage);
    }

    function renderFooterNav(navItems, basePage) {
        var left = document.getElementById('footer-nav-left');
        var right = document.getElementById('footer-nav-right');
        if (!left || !right || !navItems || !navItems.length) return;

        var sorted = navItems.slice().sort(order);
        var mid = Math.ceil(sorted.length / 2);
        var L = sorted.slice(0, mid);
        var R = sorted.slice(mid);

        function fill(ul, items) {
            ul.innerHTML = '';
            items.forEach(function (item) {
                var raw = item.externalURL || '#';
                var li = document.createElement('li');
                var a = document.createElement('a');
                setNavLink(a, raw, basePage);
                a.textContent = item.label || '';
                li.className = navClass(raw) + ' module-link';
                var nid = item.navID || item.navId;
                if (nid) li.setAttribute('data-nav-id', nid);
                li.appendChild(a);
                ul.appendChild(li);
            });
        }

        fill(left, L);
        fill(right, R);
    }

    function applyNavVisibility(mainNav, footerNav) {
        var all = (mainNav || []).concat(footerNav || []);
        var hiddenSection = {};
        (mainNav || []).forEach(function (item) {
            var u = item.externalURL || '';
            if (!u || u.charAt(0) !== '#') return;
            var vis = item.isSectionVisible !== false && item.isSectionVisible !== 0;
            if (!vis) hiddenSection[u] = true;
        });

        Object.keys(hiddenSection).forEach(function (url) {
            var sec = document.querySelector(url);
            if (sec) sec.style.display = 'none';
            var cls = navClass(url);
            document.querySelectorAll('.' + cls).forEach(function (el) {
                el.style.display = 'none';
            });
        });

        all.forEach(function (item) {
            var u = item.externalURL || '';
            if (!u || u.charAt(0) !== '#') return;
            if (hiddenSection[u]) return;
            var linkOk = item.isVisible !== false && item.isVisible !== 0;
            if (linkOk) return;
            var nid = item.navID || item.navId;
            if (!nid) return;
            document.querySelectorAll('[data-nav-id="' + nid + '"]').forEach(function (el) {
                el.style.display = 'none';
            });
        });
    }

    function setText(id, t) {
        var el = document.getElementById(id);
        if (el) el.textContent = t || '';
    }

    function setAddr(id, addr) {
        var el = document.getElementById(id);
        if (!el) return;
        if (!addr) {
            el.textContent = '';
            el.href = '#';
            return;
        }
        el.textContent = addr;
        el.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addr);
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
    }

    function setHref(id, href) {
        var el = document.getElementById(id);
        if (el) el.href = href || '#';
    }

    function show(id, on) {
        var el = document.getElementById(id);
        if (el) el.style.display = on ? '' : 'none';
    }

    function escHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    window.SiteConfig = {
        load: function (apiBase, companyUrl, options) {
            options = options || {};
            var basePage = options.basePage || 'index.html';

            return fetch(apiBase + '/api/site-config?companyUrl=' + encodeURIComponent(companyUrl))
                .then(function (r) {
                    return r.json();
                })
                .then(function (config) {
                    var mainNav = config.nav && config.nav.main ? config.nav.main : [];
                    var footerNav = config.nav && config.nav.footer ? config.nav.footer : [];
                    var ctaNav = config.nav && (config.nav.cTA || config.nav.CTA || config.nav.cta || []);
                    var company = (config && config.company) || {};

                    renderCompany(company, basePage);
                    renderContact(company);
                    renderMainNav(mainNav, ctaNav, basePage);
                    renderFooterNav(footerNav, basePage);
                    applyNavVisibility(mainNav, footerNav);

                    if (typeof options.onLoad === 'function') options.onLoad(config);
                    return config;
                })
                .catch(function (err) {
                    console.error('SiteConfig:', err);
                    if (typeof options.onLoad === 'function') options.onLoad({});
                });
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        if (window.__cakieSkipAutoSiteBootstrap) return;
        fetch('/api/GetAppSettings', { headers: { Accept: 'application/json' } })
            .then(function (r) {
                return r.json();
            })
            .then(function (settings) {
                var base = (settings.FusionCMS || settings.fusionCMS || '').replace(/\/$/, '');
                if (!base || !window.SiteConfig) return;
                window.__fusionApiBase = base;
                return SiteConfig.load(base, window.location.hostname, { basePage: 'index.html' });
            })
            .catch(function () {});
    });
})();
