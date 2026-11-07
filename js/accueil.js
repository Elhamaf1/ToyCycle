// ============================================================
// TOYCYCLE - PAGE ACCUEIL
// PHP + MYSQL
// ============================================================
// Ce fichier remplace l'ancien système basé sur localStorage.
// Les annonces et les favoris viennent maintenant de la BDD
// via php/annonces.php et php/favoris.php (même API que
// la page Favoris).
// ============================================================

const API_ANNONCES = "php/annonces.php";
const API_FAVORIS = "php/favoris.php";


// ============================================================
// ÉTAT GLOBAL DE LA PAGE
// ============================================================

let annoncesGlobales = [];
let favorisGlobaux = [];


// ============================================================
// PARTIE 1 : RECHERCHE
// ============================================================

const formulaireRecherche = document.getElementById("accueilSearchForm");
const champRecherche = document.getElementById("accueilSearchInput");

if (formulaireRecherche && champRecherche) {

    formulaireRecherche.addEventListener("submit", function (event) {

        event.preventDefault();

        const recherche = champRecherche.value.trim();

        // Rien n'a été écrit -> on va vers toutes les annonces
        if (recherche === "") {
            window.location.href = "annonces.html";
            return;
        }

        // Exemple : "Lego City" -> "Lego%20City"
        const rechercheEncodee = encodeURIComponent(recherche);

        window.location.href = "annonces.html?recherche=" + rechercheEncodee;
    });
}


// ============================================================
// PARTIE 2 : CATÉGORIES
// ============================================================
// Les cartes catégories sont désormais rendues directement
// par accueil.php (côté serveur) avec un lien <a href="..."> déjà
// prêt vers annonces.html?categorie=... donc aucun JS n'est requis
// ici. On garde simplement un petit effet visuel au clic si besoin.

document.addEventListener("DOMContentLoaded", function () {

    const categories = document.querySelectorAll(".category-card");

    categories.forEach(function (carte) {

        carte.addEventListener("click", function () {
            carte.classList.add("category-card--active");
        });

    });

});


// ============================================================
// PARTIE 3 : CHARGEMENT DES DONNÉES DEPUIS L'API
// ============================================================

async function chargerDonneesAccueil() {

    // --------------------------------------------------------
    // 3.1 - Charger les annonces (toujours nécessaire)
    // --------------------------------------------------------

    try {

        const resAnnonces = await fetch(API_ANNONCES).then(r => r.json());

        annoncesGlobales = resAnnonces.success
            ? resAnnonces.annonces
            : [];

    } catch (erreur) {

        console.error(
            "Erreur lors de la récupération des annonces :",
            erreur
        );

        annoncesGlobales = [];
    }


    // --------------------------------------------------------
    // 3.2 - Charger les favoris (optionnel : l'utilisateur
    //       peut ne pas être connecté, ce n'est pas bloquant)
    // --------------------------------------------------------

    try {

        const reponseFavoris = await fetch(API_FAVORIS);
        const resFavoris = await reponseFavoris.json();

        favorisGlobaux = resFavoris.success
            ? resFavoris.favoris.map(Number)
            : [];

    } catch (erreur) {

        // Utilisateur non connecté ou erreur réseau :
        // on continue simplement sans favoris.
        favorisGlobaux = [];
    }


    // --------------------------------------------------------
    // 3.3 - Afficher les différentes sections
    // --------------------------------------------------------

    afficherDernieresAnnonces();
    afficherAnnoncesParMode("Échange", "echangeContainer");
    afficherAnnoncesParMode("Vente", "venteContainer");
}


// ============================================================
// AIDES : IMAGE / PRIX / FAVORI
// ============================================================

function getImagePrincipale(annonce) {

    if (
        Array.isArray(annonce.images) &&
        annonce.images.length > 0 &&
        annonce.images[0].chemin
    ) {
        return annonce.images[0].chemin;
    }

    return "images/default.jpg";
}

function getPrixAffiche(annonce) {

    if (annonce.prix === null || annonce.prix === undefined || annonce.prix === "") {
        return annonce.mode === "Échange" ? "Échange" : "Gratuit";
    }

    return annonce.prix + " DH";
}

function estFavoriAccueil(idAnnonce) {
    return favorisGlobaux.includes(Number(idAnnonce));
}


// ============================================================
// CONSTRUCTION D'UNE CARTE ANNONCE (utilisée par les 2 sections)
// ============================================================

function creerCarteAnnonce(annonce) {

    const id = Number(annonce.id_annonce);
    const estFavori = estFavoriAccueil(id);

    const image = getImagePrincipale(annonce);
    const prix = getPrixAffiche(annonce);

    const col = document.createElement("div");

    col.classList.add("col-lg-3", "col-md-6", "col-12");

    col.innerHTML = `
        <div class="card">

            <!-- COEUR FAVORI -->
            <button
                type="button"
                class="removeFavorite accueil-favori"
                data-id="${id}"
                aria-label="${estFavori ? "Retirer des favoris" : "Ajouter aux favoris"}">

                <i class="${estFavori ? "fa-solid" : "fa-regular"} fa-heart"></i>

            </button>

            <!-- IMAGE -->
            <img
                src="${image}"
                class="cardImage"
                alt="${annonce.titre || "Annonce"}"
                onerror="this.src='images/default.jpg'">

            <!-- CONTENU -->
            <div class="bodycard">

                <h5>${annonce.titre || ""}</h5>

                <p class="price">${prix}</p>

                <p class="city">${annonce.ville || ""}</p>

                <a
                    href="detail_annonces.html?id=${id}"
                    class="voirBtn">
                    Voir
                </a>

            </div>

        </div>
    `;

    return col;
}


// ============================================================
// TRI DES ANNONCES (les plus récentes d'abord)
// ============================================================

function trierParDateDesc(annonces) {

    return [...annonces].sort(function (a, b) {

        const dateA = a.date_publication ? new Date(a.date_publication) : null;
        const dateB = b.date_publication ? new Date(b.date_publication) : null;

        if (dateA && dateB) {
            return dateB - dateA;
        }

        if (dateA) {
            return -1;
        }

        if (dateB) {
            return 1;
        }

        return Number(b.id_annonce) - Number(a.id_annonce);
    });
}


// ============================================================
// AFFICHER LES DERNIÈRES ANNONCES (toutes catégories confondues)
// ============================================================

function afficherDernieresAnnonces() {

    const container = document.getElementById("latestContainer");

    if (!container) {
        return;
    }

    const dernieresAnnonces = trierParDateDesc(annoncesGlobales).slice(0, 4);

    container.innerHTML = "";

    if (dernieresAnnonces.length === 0) {

        container.innerHTML = `
            <div class="col-12">
                <p class="text-center">Aucune annonce disponible.</p>
            </div>
        `;

        return;
    }

    dernieresAnnonces.forEach(function (annonce) {
        container.appendChild(creerCarteAnnonce(annonce));
    });

    ajouterEvenementsFavorisAccueil();
}


// ============================================================
// AFFICHER LES ANNONCES PAR MODE (Vente / Échange)
// ============================================================

function afficherAnnoncesParMode(mode, containerId) {

    const container = document.getElementById(containerId);

    if (!container) {
        return;
    }

    const annoncesMode = trierParDateDesc(
        annoncesGlobales.filter(annonce => annonce.mode === mode)
    ).slice(0, 4);

    container.innerHTML = "";

    if (annoncesMode.length === 0) {

        container.innerHTML = `
            <div class="col-12">
                <p class="text-center">Aucune annonce disponible.</p>
            </div>
        `;

        return;
    }

    annoncesMode.forEach(function (annonce) {
        container.appendChild(creerCarteAnnonce(annonce));
    });

    ajouterEvenementsFavorisAccueil();
}


// ============================================================
// GESTION DES FAVORIS (ajout / suppression via l'API)
// ============================================================

async function toggleFavoriAccueil(idAnnonce, iconElement) {

    const id = Number(idAnnonce);
    const estFavori = favorisGlobaux.includes(id);

    try {

        let response;

        if (estFavori) {

            // Retirer le favori
            response = await fetch(`${API_FAVORIS}?id_annonce=${id}`, {
                method: "DELETE"
            });

        } else {

            // Ajouter le favori
            response = await fetch(API_FAVORIS, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id_annonce: id })
            });
        }

        // Utilisateur non connecté -> rediriger vers la connexion
        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        const data = await response.json();

        if (!data.success) {

            console.error(
                "Erreur lors de la mise à jour du favori :",
                data.message
            );

            return;
        }

        // Mettre à jour l'état local des favoris
        if (estFavori) {

            favorisGlobaux = favorisGlobaux.filter(
                favoriId => favoriId !== id
            );

        } else {

            favorisGlobaux.push(id);
        }

        // Mettre à jour le coeur affiché, sans tout recharger
        if (iconElement) {

            iconElement.classList.toggle("fa-solid");
            iconElement.classList.toggle("fa-regular");

            const bouton = iconElement.closest(".accueil-favori");

            if (bouton) {

                bouton.setAttribute(
                    "aria-label",
                    estFavori ? "Ajouter aux favoris" : "Retirer des favoris"
                );
            }
        }

    } catch (erreur) {

        console.error(
            "Erreur lors de la mise à jour du favori :",
            erreur
        );
    }
}


// ============================================================
// ÉVÉNEMENTS DES COEURS (dernières annonces + vente/échange)
// ============================================================

function ajouterEvenementsFavorisAccueil() {

    const boutons = document.querySelectorAll(".accueil-favori");

    boutons.forEach(function (button) {

        // Éviter d'attacher deux fois le même événement
        // sur un bouton déjà initialisé.
        if (button.dataset.ecouteurAjoute === "true") {
            return;
        }

        button.dataset.ecouteurAjoute = "true";

        button.addEventListener("click", function () {

            const id = Number(button.dataset.id);
            const icon = button.querySelector("i");

            toggleFavoriAccueil(id, icon);
        });

    });
}


// ============================================================
// INITIALISATION ACCUEIL
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
    chargerDonneesAccueil();
});
