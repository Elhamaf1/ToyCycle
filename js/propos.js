document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // VALEURS INITIALES
    // ==============================

    const valeursInitiales = {
        jouets: 1200,
        parents: 850,
        echanges: 300,
        ventes:500
    };


    // ==============================
    // RÉCUPÉRATION DES DONNÉES
    // ==============================

    const annonces = JSON.parse(localStorage.getItem("annonces")) || [];
    const utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];

    // ==============================
    // CALCUL DES VRAIS NOMBRES
    // ==============================
    const nombreAnnonces = annonces.length;
    const nombreUtilisateurs = utilisateurs.length;
    const nombreEchanges = annonces.filter(
        annonce => annonce.mode === "Échange"
    ).length;
    const nombreVentes = annonces.filter(
        annonce => annonce.mode === "Vente"
    ).length;

    // ==============================
    // COMPARAISON AVEC LES VALEURS INITIALES
    // ==============================

    const totalJouets = Math.max(
        valeursInitiales.jouets,
        nombreAnnonces
    );

    const totalParents = Math.max(
        valeursInitiales.parents,
        nombreUtilisateurs
    );

    const totalEchanges = Math.max(
        valeursInitiales.echanges,
        nombreEchanges
    );

    const totalVentes = Math.max(
        valeursInitiales.ventes,
        nombreVentes
    );

    // ==============================
    // AFFICHAGE
    // ==============================

    document.getElementById("totalJouets").textContent =
        totalJouets;

    document.getElementById("totalParents").textContent =
        totalParents;

    document.getElementById("totalEchanges").textContent =
        totalEchanges;

    document.getElementById("totalVentes").textContent =
        totalVentes;

});