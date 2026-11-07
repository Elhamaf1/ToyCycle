/* ============================================================
   TOYCYCLE - DÉTAIL D'UNE ANNONCE
   details.js

   Les données viennent maintenant de MySQL
   via php/detail_annonce.php
============================================================ */

const API_FAVORIS = "php/favoris.php";

// Annonce actuellement affichée (mémorisée pour le toggle favori)
let annonceCourante = null;


// ============================================================
// 1. RÉCUPÉRER L'ID DANS L'URL
// ============================================================

function recupererIdAnnonce() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        params.get("id");

    if (!id) {
        return null;
    }

    return Number(id);
}


// ============================================================
// 2. RÉCUPÉRER L'ANNONCE DEPUIS PHP
// ============================================================

async function recupererAnnonce(id) {

    try {

        const response =
            await fetch(
                "php/detail_annonce.php?id=" +
                encodeURIComponent(id)
            );

        const data =
            await response.json();

        if (!data.success) {

            console.error(
                data.message
            );

            return null;
        }

        return data.annonce;

    } catch (erreur) {

        console.error(
            "Erreur récupération annonce :",
            erreur
        );

        return null;
    }
}


// ============================================================
// 3. AFFICHER LES INFORMATIONS
// ============================================================

function afficherAnnonce(annonce) {


    // --------------------------------------------------------
    // TITRE
    // --------------------------------------------------------

    const titreAnnonce =
        document.getElementById(
            "titreAnnonce"
        );

    if (titreAnnonce) {

        titreAnnonce.textContent =
            annonce.titre || "";
    }


    // --------------------------------------------------------
    // BREADCRUMB
    // --------------------------------------------------------

    const breadcrumbTitre =
        document.getElementById(
            "breadcrumbTitre"
        );

    if (breadcrumbTitre) {

        breadcrumbTitre.textContent =
            annonce.titre || "Détail";
    }


    // --------------------------------------------------------
    // MODE
    // --------------------------------------------------------

    const modeAnnonce =
        document.getElementById(
            "modeAnnonce"
        );

    if (modeAnnonce) {

        modeAnnonce.textContent =
            annonce.mode || "";
    }


 // --------------------------------------------------------
// PRIX / MODE DE TRANSACTION
// --------------------------------------------------------

const prixAnnonce =
    document.getElementById("prixAnnonce");

if (prixAnnonce) {

    // ÉCHANGE
    if (annonce.mode === "Échange") {

        prixAnnonce.textContent = "Échange";

    }

    // VENTE
    else if (annonce.mode === "Vente") {

        if (
            annonce.prix === null ||
            annonce.prix === undefined ||
            annonce.prix === "" ||
            Number(annonce.prix) === 0
        ) {

            prixAnnonce.textContent = "Gratuit";

        } else {

            prixAnnonce.textContent =
                Number(annonce.prix).toFixed(2) + " DH";
        }

    }

    // AUTRE CAS
    else {

        prixAnnonce.textContent =
            annonce.prix !== null &&
            annonce.prix !== undefined &&
            annonce.prix !== ""
                ? Number(annonce.prix).toFixed(2) + " DH"
                : "Gratuit";
    }
}


    // --------------------------------------------------------
    // CATÉGORIE
    // --------------------------------------------------------

    const categorieAnnonce =
        document.getElementById(
            "categorieAnnonce"
        );

    if (categorieAnnonce) {

        categorieAnnonce.textContent =
            annonce.categorie || "";
    }


    // --------------------------------------------------------
    // VILLE
    // --------------------------------------------------------

    const villeAnnonce =
        document.getElementById(
            "villeAnnonce"
        );

    if (villeAnnonce) {

        villeAnnonce.textContent =
            annonce.ville || "";
    }


    // --------------------------------------------------------
    // ÉTAT
    // --------------------------------------------------------

    const etatAnnonce =
        document.getElementById(
            "etatAnnonce"
        );

    if (etatAnnonce) {

        etatAnnonce.textContent =
            annonce.etat || "";
    }


    // --------------------------------------------------------
    // ÂGE
    // --------------------------------------------------------

    const ageAnnonce =
        document.getElementById(
            "ageAnnonce"
        );

    if (ageAnnonce) {

        ageAnnonce.textContent =
            annonce.age || "";
    }


    // --------------------------------------------------------
    // DESCRIPTION
    // --------------------------------------------------------

    const descriptionAnnonce =
        document.getElementById(
            "descriptionAnnonce"
        );

    if (descriptionAnnonce) {

        descriptionAnnonce.textContent =
            annonce.description || "";
    }


    // --------------------------------------------------------
    // NOTICE "C'EST VOTRE ANNONCE"
    // --------------------------------------------------------

    const proprietaireNotice =
        document.getElementById(
            "proprietaireNotice"
        );

    if (proprietaireNotice) {

        proprietaireNotice.style.display =
            annonce.est_proprietaire
                ? "flex"
                : "none";
    }


    // --------------------------------------------------------
    // TITRE DU NAVIGATEUR
    // --------------------------------------------------------

    document.title =
        (annonce.titre || "Annonce") +
        " - ToyCycle";
}


// ============================================================
// 4. AFFICHER LES IMAGES
// ============================================================

function afficherImages(annonce) {

    const mainImage =
        document.getElementById(
            "mainImage"
        );

    const thumbnails =
        document.getElementById(
            "thumbnails"
        );


    if (!mainImage || !thumbnails) {
        return;
    }


    // Vider les miniatures

    thumbnails.innerHTML = "";


    // --------------------------------------------------------
    // AUCUNE IMAGE
    // --------------------------------------------------------

    if (
        !Array.isArray(annonce.images) ||
        annonce.images.length === 0
    ) {

        mainImage.src =
            "images/default.jpg";

        mainImage.alt =
            annonce.titre || "Annonce";

        return;
    }


    // --------------------------------------------------------
    // IMAGE PRINCIPALE
    // --------------------------------------------------------

    mainImage.src =
        annonce.images[0];

    mainImage.alt =
        annonce.titre || "Annonce";


    // --------------------------------------------------------
    // MINIATURES
    // --------------------------------------------------------

    // Une seule miniature ne sert à rien : on ne les affiche
    // que s'il y a au moins 2 photos.
    if (annonce.images.length < 2) {
        return;
    }

    annonce.images.forEach(
        function (image, index) {

            if (!image) {
                return;
            }


            const miniature =
                document.createElement("img");


            miniature.src =
                image;

            miniature.alt =
                annonce.titre || "Annonce";


            miniature.classList.add(
                "thumbnail"
            );


            if (index === 0) {

                miniature.classList.add(
                    "active"
                );
            }


            // ------------------------------------------------
            // ERREUR IMAGE
            // ------------------------------------------------

            miniature.onerror =
                function () {

                    this.src =
                        "images/default.jpg";
                };


            // ------------------------------------------------
            // CLICK
            // ------------------------------------------------

            miniature.addEventListener(
                "click",
                function () {

                    mainImage.src =
                        image;


                    document
                        .querySelectorAll(
                            ".thumbnail"
                        )
                        .forEach(
                            function (element) {

                                element.classList.remove(
                                    "active"
                                );

                            }
                        );


                    miniature.classList.add(
                        "active"
                    );
                }
            );


            thumbnails.appendChild(
                miniature
            );
        }
    );


    // --------------------------------------------------------
    // ERREUR IMAGE PRINCIPALE
    // --------------------------------------------------------

    mainImage.onerror =
        function () {

            this.src =
                "images/default.jpg";
        };
}

// ============================================================
// WHATSAPP
// Le numéro vient du profil du propriétaire
// ============================================================

function afficherWhatsApp(annonce) {

    const bouton =
        document.getElementById("whatsappBtn");

    if (!bouton) {
        return;
    }

    // --------------------------------------------------------
    // Sa propre annonce
    // --------------------------------------------------------

    if (annonce.est_proprietaire) {

        bouton.style.display = "none";

        return;
    }

    // --------------------------------------------------------
    // Vérifier le téléphone
    // --------------------------------------------------------

    if (
        !annonce.telephone_vendeur ||
        String(annonce.telephone_vendeur).trim() === ""
    ) {

        bouton.removeAttribute("href");

        bouton.classList.add(
            "whatsappBtn--desactive"
        );

        bouton.innerHTML = `
            <i class="fa-solid fa-circle-info"></i>
            Numéro WhatsApp non renseigné
        `;

        bouton.style.display = "inline-flex";

        return;
    }

    // --------------------------------------------------------
    // Nettoyer le numéro
    // Exemple :
    // 0612345678 → 212612345678
    // --------------------------------------------------------

    let telephone =
        String(annonce.telephone_vendeur)
            .replace(/\D/g, "");

    if (telephone.startsWith("0")) {

        telephone =
            "212" + telephone.substring(1);
    }

    // --------------------------------------------------------
    // Vérifier le format marocain
    // --------------------------------------------------------

    if (
        !telephone.startsWith("212") ||
        telephone.length !== 12
    ) {

        console.error(
            "Numéro invalide :",
            annonce.telephone_vendeur
        );

        bouton.removeAttribute("href");

        bouton.classList.add(
            "whatsappBtn--desactive"
        );

        bouton.innerHTML = `
            <i class="fa-solid fa-circle-info"></i>
            Numéro WhatsApp invalide
        `;

        bouton.style.display = "inline-flex";

        return;
    }

    // --------------------------------------------------------
    // Message
    // --------------------------------------------------------

    const message =
        encodeURIComponent(
            "Bonjour, je suis intéressé(e) par votre annonce : " +
            annonce.titre
        );

    // --------------------------------------------------------
    // Lien WhatsApp
    // --------------------------------------------------------

    bouton.href =
        "https://wa.me/" +
        telephone +
        "?text=" +
        message;

    bouton.target = "_blank";

    bouton.rel =
        "noopener noreferrer";

    bouton.classList.remove(
        "whatsappBtn--desactive"
    );

    bouton.innerHTML = `
        <i class="fa-brands fa-whatsapp"></i>
        Contacter sur WhatsApp
    `;

    bouton.style.display =
        "inline-flex";
}


// ============================================================
// 6. FAVORI (COEUR)
// ============================================================

function afficherFavoriBtn(annonce) {

    const bouton =
        document.getElementById("favoriDetailBtn");

    if (!bouton) {
        return;
    }

    // Pas de coeur sur sa propre annonce
    if (annonce.est_proprietaire) {

        bouton.style.display = "none";
        return;
    }

    bouton.style.display = "inline-flex";

    mettreAJourIconeFavori(bouton, annonce.est_favori);

    // Éviter d'attacher l'événement plusieurs fois si
    // afficherFavoriBtn est rappelée.
    if (bouton.dataset.ecouteurAjoute === "true") {
        return;
    }

    bouton.dataset.ecouteurAjoute = "true";

    bouton.addEventListener("click", function () {
        toggleFavoriDetail(annonce.id_annonce, bouton);
    });
}

function mettreAJourIconeFavori(bouton, estFavori) {

    const icon = bouton.querySelector("i");

    if (!icon) {
        return;
    }

    icon.classList.remove("fa-regular", "fa-solid");
    icon.classList.add(estFavori ? "fa-solid" : "fa-regular");

    bouton.setAttribute(
        "aria-label",
        estFavori ? "Retirer des favoris" : "Ajouter aux favoris"
    );

    bouton.classList.toggle("active", estFavori);
}

async function toggleFavoriDetail(idAnnonce, bouton) {

    if (!annonceCourante) {
        return;
    }

    const estFavori = annonceCourante.est_favori;

    bouton.disabled = true;

    try {

        let response;

        if (estFavori) {

            response = await fetch(
                `${API_FAVORIS}?id_annonce=${idAnnonce}`,
                { method: "DELETE" }
            );

        } else {

            response = await fetch(API_FAVORIS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_annonce: idAnnonce })
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

        annonceCourante.est_favori = !estFavori;
        mettreAJourIconeFavori(bouton, annonceCourante.est_favori);

    } catch (erreur) {

        console.error(
            "Erreur lors de la mise à jour du favori :",
            erreur
        );

    } finally {

        bouton.disabled = false;
    }
}


// ============================================================
// 7. ANNONCE INTROUVABLE
// ============================================================

function annonceIntrouvable() {

    const detail =
        document.querySelector(
            ".detail"
        );


    if (!detail) {
        return;
    }


    detail.innerHTML = `

        <div class="container">

            <div class="text-center py-5">

                <h2>
                    Annonce introuvable
                </h2>

                <p>
                    Cette annonce n'existe pas
                    ou a été supprimée.
                </p>

                <a
                    href="annonces.html"
                    class="voirBtn">

                    Retour aux annonces

                </a>

            </div>

        </div>
    `;
}


// ============================================================
// 8. ERREUR SERVEUR
// ============================================================

function afficherErreurServeur() {

    const detail =
        document.querySelector(
            ".detail"
        );


    if (!detail) {
        return;
    }


    detail.innerHTML = `

        <div class="container">

            <div class="text-center py-5">

                <h2>
                    Erreur
                </h2>

                <p>
                    Impossible de récupérer
                    l'annonce depuis le serveur.
                </p>

                <a
                    href="annonces.html"
                    class="voirBtn">

                    Retour aux annonces

                </a>

            </div>

        </div>
    `;
}


// ============================================================
// 9. INITIALISATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {


        // ----------------------------------------------------
        // ID
        // ----------------------------------------------------

        const id =
            recupererIdAnnonce();


        // ----------------------------------------------------
        // ID INVALIDE
        // ----------------------------------------------------

        if (
            id === null ||
            isNaN(id)
        ) {

            annonceIntrouvable();

            return;
        }


        // ----------------------------------------------------
        // RÉCUPÉRER DEPUIS MYSQL
        // ----------------------------------------------------

        const annonce =
            await recupererAnnonce(id);


        // ----------------------------------------------------
        // ANNONCE INTROUVABLE
        // ----------------------------------------------------

        if (!annonce) {

            annonceIntrouvable();

            return;
        }


        // ----------------------------------------------------
        // AFFICHAGE
        // ----------------------------------------------------

        annonceCourante = annonce;

        afficherAnnonce(
            annonce
        );


        afficherImages(
            annonce
        );


        afficherWhatsApp(
            annonce
        );


        afficherFavoriBtn(
            annonce
        );

    }
);