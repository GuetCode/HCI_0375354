// privacy-policy - cakie
(function () {
    "use strict";

    var COMPANY_URL = window.location.hostname;
    var URL_PATH = "/privacy-policy";
    var API_BASE = "/api";

    document.addEventListener("DOMContentLoaded", init);

    async function init() {
        try {
            API_BASE = await resolveApiBase();
            var pageAndBrand = await Promise.all([
                apiGet("/page", { companyUrl: COMPANY_URL, urlPath: URL_PATH }),
                fetchCompanyDisplayName()
            ]);
            var response = pageAndBrand[0];
            var brandName = pageAndBrand[1];
            var pageData = normalizePageData(response);
            var sectionData = pageData && pageData.sectionData ? pageData.sectionData : null;
            if (!sectionData) return;

            renderHeader(sectionData.header, brandName);
            renderContent(sectionData.content);
        } catch (err) {
            console.error("privacy-policy.js init failed:", err);
        }
    }

    async function fetchCompanyDisplayName() {
        try {
            var cfg = await apiGet("/site-config", { companyUrl: COMPANY_URL });
            var c = cfg && cfg.company;
            if (!c) return "";
            return (c.companyName || c.CompanyName || "").trim();
        } catch (_e) {
            return "";
        }
    }

    async function resolveApiBase() {
        try {
            var cfg = await fetchJson("/api/GetAppSettings");
            var host = (cfg && (cfg.fusionCMS || cfg.FusionCMS)) || "";
            return host ? host.replace(/\/$/, "") + "/api" : "/api";
        } catch (_e) {
            return "/api";
        }
    }

    async function apiGet(path, query) {
        var url = new URL(API_BASE + path, window.location.origin);
        Object.keys(query || {}).forEach(function (key) {
            url.searchParams.set(key, query[key]);
        });
        return fetchJson(url.toString());
    }

    async function fetchJson(url) {
        var res = await fetch(url, { headers: { "Accept": "application/json" } });
        if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
        return res.json();
    }

    function normalizePageData(response) {
        var data = response && response.pageData;
        if (typeof data === "string") {
            try { data = JSON.parse(data); } catch (_e) { return null; }
        }
        return data || null;
    }

    function renderHeader(header, brandName) {
        if (!header) return;

        var titleEl = document.getElementById("privacyTitle");
        var updatedEl = document.getElementById("privacyLastUpdated");

        if (titleEl && header.title) titleEl.textContent = header.title;
        if (updatedEl && header.lastUpdated) updatedEl.textContent = "Last Updated: " + header.lastUpdated;
        if (header.title) {
            document.title = brandName ? brandName + " | " + header.title : header.title;
        }
    }

    function renderContent(content) {
        if (!content || !Array.isArray(content.sections)) return;

        var container = document.getElementById("privacySections");
        if (!container) return;

        var html = content.sections.map(function (section) {
            return (
                '<article class="privacy-section">' +
                '<h2 class="privacy-section-title">' + esc(section.title) + "</h2>" +
                '<div class="privacy-section-content">' +
                "<p>" + (section.content || "") + "</p>" +
                "</div>" +
                "</article>"
            );
        }).join("");

        if (html) container.innerHTML = html;
    }

    function esc(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
})();
