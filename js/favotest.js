// ======================================================
// TOYCYCLE - PAGE FAVORIS
// ======================================================
let annonces = [];
function getAnnoncesPubliees() {

    const donnees = localStorage.getItem("annonces");

    if (!donnees) {
        return [];
    }

    try {

        const resultat = JSON.parse(donnees);

        if (!Array.isArray(resultat)) {
            return [];
        }

        return resultat;

    } catch (erreur) {

        console.error(
            "Erreur lors de la récupération des annonces :",
            erreur
        );

        return [];
    }
}
// ------------------------------------------------------
// Récupérer les favoris depuis localStorage
// ------------------------------------------------------

function getFavoris() {

    const favoris =
        JSON.parse(
            localStorage.getItem("favoris")
        ) || [];
    /* Convertir les IDs en nombres.
       Cela évite un problème si localStorage
       contient "1" au lieu de 1.
    */
    return favoris.map(function (id) {
        return Number(id);
    });
}


// ------------------------------------------------------
// Sauvegarder les favoris
// ------------------------------------------------------

function sauvegarderFavoris(favoris) {

    localStorage.setItem(
        "favoris",
        JSON.stringify(favoris)
    );

}


// ======================================================
// AFFICHER LES FAVORIS
// ======================================================

function afficherFavoris() {


    /*
       Récupérer le conteneur HTML.
    */

    const container =
        document.getElementById(
            "favorisContainer"
        );


    /*
       Vérifier que le conteneur existe.
    */

    if (!container) {

        return;

    }


    /*
       Récupérer les IDs favoris.
    */

    const favoris =
        getFavoris();


    /*
       Transformer les IDs en annonces.

       Exemple :

       favoris = [1, 2]

       devient :

       annoncesFavorites = [
           annonce 1,
           annonce 2
       ]
    */

    const annoncesFavorites =
        annonces.filter(function (annonce) {

            return favoris.includes(
                Number(annonce.id)
            );

        });


    /*
       Vider le conteneur avant
       de recréer les cartes.
    */

    container.innerHTML = "";


    // --------------------------------------------------
    // Aucun favori
    // --------------------------------------------------

    if (annoncesFavorites.length === 0) {

        container.innerHTML = `

            <div class="col-12">

                <div class="text-center py-5">

                    <i
                        class="fa-regular fa-heart"
                        style="font-size: 50px;">
                    </i>

                    <h4 class="mt-3">
                        Aucun favori
                    </h4>

                    <p>
                        Vous n'avez pas encore ajouté
                        de jouet à vos favoris.
                    </p>

                    <a
                        href="annonces.html"
                        class="voirBtn">

                        Voir les annonces

                    </a>

                </div>

            </div>

        `;

        return;
    }


    // --------------------------------------------------
    // Créer les cartes
    // --------------------------------------------------

    annoncesFavorites.forEach(function (annonce) {


        /*
           Créer une colonne Bootstrap.
        */

        const col =
            document.createElement("div");


        col.classList.add(
            "col-lg-3",
            "col-md-6",
            "col-12"
        );


        /*
           Récupérer la première image.

           Si l'annonce n'a pas d'image,
           utiliser une image par défaut.
        */

        const image =
            annonce.images &&
            annonce.images.length > 0

                ? annonce.images[0]

                : "images/default.jpg";


        /*
           Créer la carte.
        */

        col.innerHTML = `

            <div class="favoriCard">


                <!-- ==============================
                     BOUTON SUPPRIMER FAVORI
                =============================== -->

                <button
                    type="button"
                    class="removeFavorite"
                    data-id="${annonce.id}">

                    <i class="fa-solid fa-heart"></i>

                </button>


                <!-- ==============================
                     IMAGE
                =============================== -->

                <img
                    src="${image}"
                    alt="${annonce.titre}"
                    class="favoriImage">


                <!-- ==============================
                     CONTENU
                =============================== -->
                <div class="favoriBody">
                    <h5>
                        ${annonce.titre}
                    </h5>
                    <p class="price">
                        ${annonce.prix}
                    </p>
                    <p class="city">
                        ${annonce.ville}
                    </p>
                    <a
                        href="details_annonce.html?id=${annonce.id}"
                        class="voirBtn">
                        Voir
                    </a>
                </div>
            </div>
        `;

        /*
           Ajouter la carte au conteneur.
        */

        container.appendChild(col);

    });
    ajouterEvenementsFavoris();

}

// ======================================================
// SUPPRIMER UN FAVORI
// ======================================================

function supprimerFavori(id) {

    // Récupérer les favoris
    let favoris = getFavoris();

    // Supprimer l'ID
    favoris = favoris.filter(function (favoriId) {

        return Number(favoriId) !== Number(id);

    });

    // Sauvegarder
    sauvegarderFavoris(favoris);

    // --------------------------------------------------
    // SUPPRIMER LA CARTE IMMÉDIATEMENT
    // --------------------------------------------------

    const bouton = document.querySelector(
        `.removeFavorite[data-id="${id}"]`
    );

    if (bouton) {

        const carte = bouton.closest(".col-lg-3");

        if (carte) {
            carte.remove();
        }
    }

    // --------------------------------------------------
    // Vérifier s'il reste des favoris
    // --------------------------------------------------

    const favorisRestants = getFavoris();

    if (favorisRestants.length === 0) {

        afficherFavoris();
    }
}

// ======================================================
// ÉVÉNEMENTS DES BOUTONS ❤️
// ======================================================

function ajouterEvenementsFavoris() {


    /*
       Récupérer tous les boutons
       ayant la classe removeFavorite.
    */

    const boutons =
        document.querySelectorAll(
            ".removeFavorite"
        );


    /*
       Ajouter un événement à chaque bouton.
    */

    boutons.forEach(function (button) {


        button.addEventListener(
            "click",
            function () {


                /*
                   Récupérer l'ID
                   depuis data-id.
                */

                const id =
                    Number(
                        this.dataset.id
                    );


                /*
                   Supprimer le favori.
                */

                supprimerFavori(id);

            }
        );

    });

}


// ======================================================
// INITIALISATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Récupérer les annonces publiées
        annonces = getAnnoncesPubliees();
        afficherFavoris();

    }
);