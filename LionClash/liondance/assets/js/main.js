// main.js — cakie 
window.__cakieSkipAutoSiteBootstrap = true;

document.addEventListener('DOMContentLoaded', function () {
    var companyUrl = window.location.hostname;
    var apiBase = '';
    var hashScrollRo = null;
    var hashScrollRoDisconnectTimer = null;

    // CMS field aliases 
    var F = {
        aboutBody: ['aboutDescription', 'AboutDescription', 'description', 'Description', 'story', 'Story'],
        storyTitle: ['storyTitle', 'StoryTitle', 'ourStoryTitle', 'OurStoryTitle', 'aboutTitle', 'AboutTitle', 'aboutUsTitle', 'AboutUsTitle', 'leftTitle', 'LeftTitle', 'title', 'Title'],
        whyTitle: ['whyUsTitle', 'WhyUsTitle', 'whyUsHeading', 'WhyUsHeading', 'rightTitle', 'RightTitle'],
        whyBody: ['whyUsDescription', 'WhyUsDescription', 'whyUsBody', 'WhyUsBody'],
        procTitle: ['title', 'Title'],
        procDesc: ['description', 'Description'],
        stepNum: ['stepNumber', 'StepNumber', 'step', 'Step', 'order', 'Order', 'displayOrder', 'DisplayOrder']
    };

    function headerScrollOffset() {
        var header = document.querySelector('.header');
        return header ? header.offsetHeight + 12 : 90;
    }

    function scrollElementIntoViewBelowHeader(el) {
        if (!el) return;
        var top = el.getBoundingClientRect().top + window.pageYOffset - headerScrollOffset();
        window.scrollTo(0, top > 0 ? top : 0);
    }

    function ensureDeferredHomeHashScroll() {
        var hash = (window.location.hash || '').toLowerCase();
        if (!hash || hash === '#') return;
        var el = null;
        switch (hash) {
            case '#hero-section':
                el = document.getElementById('hero-section');
                break;
            case '#aboutus-section':
                el = document.getElementById('about') || document.querySelector('.aboutus-section');
                break;
            case '#process-section':
                el = document.getElementById('methodology') || document.querySelector('.process-section');
                break;
            case '#awards-section':
                el = document.getElementById('awards') || document.querySelector('.awards-section');
                break;
            case '#testimonials-section':
                el = document.getElementById('testimonials') || document.querySelector('.testimonials-section');
                break;
            case '#careers':
            case '#career-section':
                el = document.getElementById('careers') || document.getElementById('career-section');
                break;
            case '#footer-section':
                el = document.getElementById('footer-section');
                break;
            default:
                return;
        }
        scrollElementIntoViewBelowHeader(el);
    }

    function disconnectHashScrollObservers() {
        if (hashScrollRo) {
            hashScrollRo.disconnect();
            hashScrollRo = null;
        }
        if (hashScrollRoDisconnectTimer) {
            clearTimeout(hashScrollRoDisconnectTimer);
            hashScrollRoDisconnectTimer = null;
        }
    }

    function scheduleDeferredHomeHashScroll() {
        var h = (window.location.hash || '').toLowerCase();
        if (!h || h === '#') return;
        function run() {
            ensureDeferredHomeHashScroll();
        }
        run();
        requestAnimationFrame(function () {
            requestAnimationFrame(run);
        });
        setTimeout(run, 50);
        setTimeout(run, 150);
        setTimeout(run, 400);
        setTimeout(run, 900);
    }

    function wireHashScrollLayoutObservers() {
        disconnectHashScrollObservers();
        var h = (window.location.hash || '').toLowerCase();
        var watchIds = [];
        if (h === '#testimonials-section') {
            watchIds = ['hero-section', 'about', 'methodology', 'awards'];
        } else if (h === '#awards-section') {
            watchIds = ['hero-section', 'about', 'methodology'];
        } else {
            return;
        }
        if (!window.ResizeObserver) return;
        var nodes = watchIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);
        if (!nodes.length) return;
        var deb;
        hashScrollRo = new ResizeObserver(function () {
            clearTimeout(deb);
            deb = setTimeout(ensureDeferredHomeHashScroll, 50);
        });
        nodes.forEach(function (n) {
            hashScrollRo.observe(n);
        });
        hashScrollRoDisconnectTimer = setTimeout(disconnectHashScrollObservers, 6000);
    }

    fetch('/api/GetAppSettings', { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (settings) {
            apiBase = (settings.FusionCMS || settings.fusionCMS || '').replace(/\/$/, '');
            if (!apiBase) {
                scheduleDeferredHomeHashScroll();
                return;
            }
            if (window.SiteConfig && typeof window.SiteConfig.load === 'function') {
                window.SiteConfig.load(apiBase, companyUrl, {
                    basePage: 'index.html',
                    onLoad: function () {
                        scheduleDeferredHomeHashScroll();
                    }
                });
            }
            return Promise.resolve(loadPageData()).finally(function () {
                scheduleDeferredHomeHashScroll();
                wireHashScrollLayoutObservers();
            });
        })
        .catch(function (err) { console.error('GetAppSettings failed', err); });

    window.addEventListener('hashchange', function () {
        disconnectHashScrollObservers();
        scheduleDeferredHomeHashScroll();
        wireHashScrollLayoutObservers();
    });

    scheduleDeferredHomeHashScroll();
    wireHashScrollLayoutObservers();

    // ── PAGE / SECTION API ───────────────────────────────────────────────
    
    function loadPageData() {
        return fetch(apiBase + '/api/page?companyUrl=' + encodeURIComponent(companyUrl) + '&urlPath=/')
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                if (!data) return;
                var pd = data.pageData;
                if (typeof pd === 'string') {
                    try { pd = JSON.parse(pd); } catch (_e) { pd = null; }
                }
                if (!pd || !pd.sectionData) return;
                var sd = pd.sectionData;
                renderHero(sd['hero-section'] || sd.hero || {});
                renderAbout(aboutBlock(sd));
                var proc = sd['process-section'] || sd['Process-Section'] || {};
                setText('process-title', field(proc, F.procTitle));
                setHTML('process-description', field(proc, F.procDesc));
                var aw = sd['awards-section'] || sd['Awards-Section'] || {};
                setText('awards-title', field(aw, F.procTitle));
                var awDesc = field(aw, F.procDesc);
                setHTML('awards-description', awDesc);
                var awEl = document.getElementById('awards-description');
                if (awEl) awEl.classList.toggle('d-none', !String(awDesc || '').trim());
                var ts = sd['testimonials-section'] || sd['Testimonials-Section'] || {};
                setText('testimonials-title', field(ts, F.procTitle));
                setHTML('testimonials-description', field(ts, F.procDesc));
                var cr = sd['career-section'] || sd['Career-Section'] || {};
                setText('career-title', field(cr, F.procTitle));
                setHTML('career-description', field(cr, F.procDesc));
                return Promise.all([
                    loadSection('process-section').then(renderProcess),
                    loadSection('awards-section').then(renderAwards),
                    loadSection('testimonials-section').then(renderTestimonials),
                    loadSection('career-section').then(renderCareers)
                ]);
            })
            .catch(function (err) { console.error('Page data load failed', err); });
    }

    function loadSection(sectionId) {
        var q = 'companyUrl=' + encodeURIComponent(companyUrl) +
            '&urlPath=/&sectionId=' + encodeURIComponent(sectionId);
        return fetch(apiBase + '/api/section?' + q, { headers: { Accept: 'application/json' } })
            .then(function (r) { return r.ok ? r.json() : []; })
            .then(function (items) { return Array.isArray(items) ? items : []; })
            .catch(function (err) {
                console.error('Section load failed:', sectionId, err);
                return [];
            });
    }

    // ── RENDER ───────────────────────────────────────────────────────────
    
    function renderHero(hero) {
        if (!hero) return;
        setHTML('hero-tagline', hero.heroTagline || '');
        setHTML('hero-subtitle', hero.heroSubtitle || '');
        if (!hero.heroImageURL) return;
        var heroEl = document.querySelector('#hero-section');
        if (heroEl) {
            heroEl.setAttribute('data-bg-image', hero.heroImageURL);
            heroEl.style.backgroundImage = 'url(' + hero.heroImageURL + ')';
        }
    }

    function aboutBlock(sd) {
        return sd['aboutus-section'] || sd['about-us-section'] || sd['AboutUs-Section'] || sd['About-Us-Section'] || sd.about || sd.About || {};
    }
    
    function renderAbout(about) {
        if (!about || typeof about !== 'object') return;
        setHTML('about-long', field(about, F.aboutBody));
        setTextOr('our-story-title', field(about, F.storyTitle), 'Our Story');
        setText('why-us-title', field(about, F.whyTitle));
        setHTML('why-us-desc', field(about, F.whyBody));
    }

    function renderProcess(items) {
        var container = document.getElementById('processContainer');
        if (!container) return;
        items = (items || []).filter(hasContent);
        var steps = items.length ? (getJSON(items[0]).steps || []) : [];
        if (!steps.length) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }
        container.style.display = '';
        container.innerHTML = steps.map(stepHtml).join('');
    }

    function renderAwards(items) {
        var container = document.getElementById('awardsContainer');
        var layout = document.getElementById('awardsLayout');
        if (!container) return;
        items = (items || []).filter(hasContent);
        if (!items.length) {
            container.innerHTML = '';
            if (layout) layout.style.display = 'none';
            return; 
        }
        if (layout) layout.style.display = '';
        container.innerHTML = items.map(function (item, i) {
            var json = getJSON(item);
            var title = json.title || item.Title || '';
            var what = json.shortDescription || '';
            var year = json.awardYear || '';
            var side = i % 2 === 0 ? 'award-row-left' : 'award-row-right';
            return (
                '<div class="award-row ' + side + '">' +
                '<div class="award-card">' +
                (title ? '<h3>' + esc(title) + '</h3>' : '') +
                (what ? '<p class="award-what">' + esc(what) + '</p>' : '') +
                (year ? '<p class="award-year">' + esc(year) + '</p>' : '') +
                '</div></div>'
            );
        }).join('');
    }
    
    function renderTestimonials(items) {
        var container = document.querySelector('.testimonials-container');
        if (!container) return;
        items = (items || []).filter(hasContent);
        if (!items.length) return;

        container.innerHTML = items.map(function (item) {
            var d = getJSON(item);
            var name = String(d.author || d.name || d.title || item.Title || '').trim();
            var role = String(d.role || d.position || d.shortDescription || '').trim();
            var company = String(d.company || d.companyName || '').trim();
            var quote = String(d.text || d.testimonial || d.longDescription || d.description || '').trim();
            var rating = normalizeRating(field(d, ['rating', 'Rating']));
            var rawPhoto = d.imageURL || d.mediaURL || d.MediaURL;
            var photo = '';
            if (rawPhoto != null && String(rawPhoto).trim() !== '') {
                photo = resolveUrl(String(rawPhoto).trim()) || '';
            }
            
            var quoteHtml = quote
                ? '<p class="testimonial-content">"' + esc(quote) + '"</p>'
                : '';
            var starsBlock = starsHtml(rating);
            var imageHtml = photo
                ? (
                    '<div class="author-image">' +
                    '<img src="' + esc(photo) + '" alt="' + esc(name) + '">' +
                    '</div>'
                )
                : '';
            var nameHtml = name ? '<h4>' + esc(name) + '</h4>' : '';
            var roleInner = '';
            if (role) {
                roleInner += '<span class="job-title">' + esc(role) + '</span>';
            }
            if (role && company) {
                roleInner += '<span class="author-role-sep" aria-hidden="true">·</span>';
            }
            if (company) {
                roleInner += '<span class="author-company">' + esc(company) + '</span>';
            }
            var roleHtml = roleInner ? '<p class="author-role">' + roleInner + '</p>' : '';

            return (
                '<div class="testimonial">' +
                quoteHtml +
                starsBlock +
                '<div class="testimonial-author">' +
                imageHtml +
                '<div class="author-info">' +
                nameHtml +
                roleHtml +
                '</div></div></div>'
            );
        }).join('');
    }

    function renderCareers(items) {
        var container = document.getElementById('jobsContent');
        if (!container) return;
        items = (items || []).filter(hasContent);
        if (!items.length) return; // keep static cards as fallback

        container.innerHTML = items.map(function (item) {
            var d = getJSON(item);
            var title = d.title || item.Title || 'Open Position';
            var type = d.jobType || d.employmentType || d.type || '';
            var desc = d.shortDescription || d.description || '';
            var id = item.contentID || item.ContentID || d.id || d.jobId || d.slug || '';
            var href = id ? ('job-details.html?id=' + encodeURIComponent(id)) : '#';
            return (
                '<div class="careers-card">' +
                '<div class="careers-card-content">' +
                '<h3 class="careers-job-title">' + esc(title) + '</h3>' +
                (type ? '<p class="careers-job-type">' + esc(type) + '</p>' : '') +
                '<p class="careers-job-desc">' + esc(desc) + '</p>' +
                '</div>' +
                '<a href="' + href + '" class="view-details-btn">View Details</a>' +
                '</div>'
            );
        }).join('');

        scheduleDeferredHomeHashScroll();
    }

    function stepHtml(step, i) {
        var ic = iconClass(step.icon || step.iconClass);
        var num = field(step, F.stepNum) || String(i + 1);
        return (
            '<div class="methodology-step">' +
            '<div class="methodology-step-head">' +
            '<div class="methodology-icon" aria-hidden="true"><i class="' + ic + '"></i></div>' +
            '<span class="methodology-step-num">' + esc(num) + '</span>' +
            '<h3>' + esc(step.title || '') + '</h3></div><p>' +
            esc(step.description || '') + '</p></div>'
        );
    }

    // ── HELPERS ──────────────────────────────────────────────────────────
    
    function field(obj, keys) {
        if (!obj) return '';
        for (var i = 0; i < keys.length; i++) {
            var v = obj[keys[i]];
            if (v != null && String(v).trim() !== '') return v;
        }
        return '';
    }

    function normalizeRating(value) {
        var n = parseInt(value, 10);
        if (isNaN(n) || n < 1) return 0;
        if (n > 5) return 5;
        return n;
    }

    function starsHtml(rating) {
        if (!rating) return '';
        var html = '<div class="testimonial-rating" aria-label="' + rating + ' out of 5 stars">';
        for (var i = 1; i <= 5; i++) {
            html += i <= rating
                ? '<i class="fa-solid fa-star" aria-hidden="true"></i>'
                : '<i class="fa-regular fa-star" aria-hidden="true"></i>';
        }
        return html + '</div>';
    }
    
    function resolveUrl(u) {
        if (!u || typeof u !== 'string') return u;
        if (/^https?:\/\//i.test(u)) return u;
        if (u.charAt(0) === '/') return window.location.origin + u;
        return u;
    }

    function getJSON(item) {
        var raw = item && (item.contentJSON || item.ContentJSON);
        if (!raw) return {};
        if (typeof raw === 'object') return raw;
        try { return JSON.parse(raw); } catch (_e) { return {}; }
    }

    function hasContent(item) {
        var json = getJSON(item);
        return Object.keys(json).some(function (k) {
            var v = json[k];
            if (v === null || v === undefined || v === '') return false;
            if (Array.isArray(v)) return v.length > 0;
            return true;
        });
    }

    function esc(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function iconClass(str) {
        var t = String(str || '').trim().replace(/[^\w\s\-]/g, '').replace(/\s+/g, ' ');
        if (!t) return 'fas fa-circle';
        if (/^ni\s|^icon\s/i.test(t)) return 'fas fa-circle';
        if (/\b(fas|far|fal|fab)\b/i.test(t)) return t;
        if (/^fa-/.test(t)) return 'fas ' + t;
        if (t.indexOf('fa-') >= 0) return t;
        return 'fas fa-' + t.replace(/^fa-/, '');
    }
  
    function setHTML(id, html) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = html != null && html !== '' ? html : '';
    }

    function setText(id, text) {
        var el = document.getElementById(id);
        if (el) el.textContent = text != null && text !== '' ? text : '';
    }

    function setTextOr(id, text, fallback) {
        var el = document.getElementById(id);
        if (!el) return;
        var t = text != null && String(text).trim() !== '' ? String(text).trim() : fallback;
        el.textContent = t || '';
    }

    window.addEventListener('load', function () {
        scheduleDeferredHomeHashScroll();
        wireHashScrollLayoutObservers();
    });
});
