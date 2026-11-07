/* ============================================================
   TOYCYCLE - MES ANNONCES + MODIFICATION
   PHP + MYSQL
   ============================================================ */

const API_MES_ANNONCES = "php/mes_annonces.php";
const API_SUPPRIMER = "php/supprimer_annonce.php";
const API_MODIFIER = "php/modifier_annonce.php";

let mesAnnonces = [];


/* =========================================================
   1. RÉCUPÉRER LES ANNONCES DEPUIS MYSQL
   ========================================================= */
async function obtenirMesAnnonces() {
    try {
        const response = await fetch(
            API_MES_ANNONCES,
            {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            if (response.status === 401) {

                alert("Vous devez être connecté.");

                window.location.href =
                    "se_connecter.html";

                return [];
            }

            throw new Error(
                data.message ||
                "Impossible de récupérer les annonces."
            );
        }

        return Array.isArray(data.annonces)
            ? data.annonces
            : [];

    } catch (erreur) {

        console.error(
            "Erreur lors de la récupération :",
            erreur
        );

        return [];
    }
}

/* =========================================================
   2. STATUT
   ========================================================= */
function obtenirClasseStatut(statut) {
    switch (statut) {
        case "Vendu": return "sold";
        case "Échangé": return "exchanged";
        case "Masquée": return "offline";
        case "Supprimée": return "offline";
        case "Disponible": return "online";
        default: return "online";
    }
}

/* =========================================================
   3. IMAGE PRINCIPALE
   ========================================================= */

function obtenirImagePrincipale(annonce) {

    if (
        !Array.isArray(annonce.images) ||
        annonce.images.length === 0
    ) {
        return "";
    }

    const principale =
        annonce.images.find(
            image => image.principale === true
        );

    if (principale) {

        return principale.chemin;
    }

    return annonce.images[0].chemin;
}


/* =========================================================
   4. ÉCHAPPER HTML
   ========================================================= */

function echapperHTML(texte) {

    const div =
        document.createElement("div");

    div.textContent =
        texte ?? "";

    return div.innerHTML;
}


/* =========================================================
   5. AFFICHER UNE LIGNE
   ========================================================= */

function creerLigneAnnonce(annonce) {

    const ligne =
        document.createElement("tr");


    /* =====================================================
       IMAGE
       ===================================================== */

    const celluleImage =
        document.createElement("td");

    const image =
        document.createElement("img");

    const cheminImage =
        obtenirImagePrincipale(annonce);

    if (cheminImage) {

        image.src =
            cheminImage;

    } else {

        image.style.visibility =
            "hidden";
    }

    image.alt =
        annonce.titre || "Annonce";

    image.className =
        "annonce-photo";

    image.addEventListener(
        "error",
        function () {

            this.style.visibility =
                "hidden";
        }
    );

    celluleImage.appendChild(
        image
    );


    /* =====================================================
       TITRE
       ===================================================== */

    const celluleTitre =
        document.createElement("td");

    celluleTitre.innerHTML = `
        <strong>
            ${echapperHTML(annonce.titre)}
        </strong>

        <br>

        <small>
            ${echapperHTML(annonce.categorie)}
        </small>
    `;


    /* =====================================================
       PRIX
       ===================================================== */

    const cellulePrix =
        document.createElement("td");

    if (annonce.mode === "Échange") {

        cellulePrix.textContent =
            "Échange";

    } else {

        cellulePrix.textContent =
            `${annonce.prix ?? ""} DH`;
    }


    /* =====================================================
       DATE
       ===================================================== */

    const celluleDate =
        document.createElement("td");

    celluleDate.textContent =
        formaterDate(
            annonce.date_publication
        );


    /* =====================================================
       STATUT
       ===================================================== */

    const celluleStatut =
        document.createElement("td");

    const statut =
        document.createElement("span");

    statut.className =
        `status ${obtenirClasseStatut(annonce.statut)}`;

    statut.textContent =
        annonce.statut || "Disponible";

    celluleStatut.appendChild(
        statut
    );


    /* =====================================================
       ACTIONS
       ===================================================== */

    const celluleActions =
        document.createElement("td");


    /* MODIFIER */

    const boutonModifier =
        document.createElement("button");

    boutonModifier.type =
        "button";

    boutonModifier.className =
        "editAnnonce";

    boutonModifier.title =
        "Modifier l'annonce";

    boutonModifier.innerHTML =
        `<i class="fa-solid fa-pen"></i>`;

    boutonModifier.addEventListener(
        "click",
        function () {

            modifierAnnonce(
                annonce.id_annonce
            );
        }
    );


    /* SUPPRIMER */

    const boutonSupprimer =
        document.createElement("button");

    boutonSupprimer.type =
        "button";

    boutonSupprimer.className =
        "deleteAnnonce";

    boutonSupprimer.title =
        "Supprimer l'annonce";

    boutonSupprimer.innerHTML =
        `<i class="fa-solid fa-trash"></i>`;

    boutonSupprimer.addEventListener(
        "click",
        function () {

            supprimerAnnonce(
                annonce.id_annonce,
                annonce.titre
            );
        }
    );


    celluleActions.appendChild(
        boutonModifier
    );

    celluleActions.appendChild(
        boutonSupprimer
    );


    /* =====================================================
       AJOUTER LES CELLULES
       ===================================================== */

    ligne.appendChild(
        celluleImage
    );

    ligne.appendChild(
        celluleTitre
    );

    ligne.appendChild(
        cellulePrix
    );

    ligne.appendChild(
        celluleDate
    );

    ligne.appendChild(
        celluleStatut
    );

    ligne.appendChild(
        celluleActions
    );


    return ligne;
}


/* =========================================================
   6. FORMATTER DATE
   ========================================================= */

function formaterDate(dateSQL) {

    if (!dateSQL) {
        return "";
    }

    const date =
        new Date(
            dateSQL.replace(" ", "T")
        );

    if (isNaN(date.getTime())) {
        return dateSQL;
    }

    return date.toLocaleDateString(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


/* =========================================================
   7. AFFICHER MES ANNONCES
   ========================================================= */

function afficherMesAnnonces() {

    const container =
        document.getElementById(
            "mesAnnoncesContainer"
        );

    if (!container) {
        return;
    }

    container.replaceChildren();


    if (mesAnnonces.length === 0) {
        const ligne = document.createElement("tr");
        ligne.innerHTML = `
            <td colspan="6" class="text-center">
                <div class="aucune-annonce">
                    <i class="fa-regular fa-folder-open"></i>
                    <p>Vous n'avez aucune annonce.</p>
                    
                </div>
            </td>
        `;

        container.appendChild(
            ligne
        );

        return;
    }


    const fragment =
        document.createDocumentFragment();

    mesAnnonces.forEach(
        function (annonce) {

            fragment.appendChild(
                creerLigneAnnonce(
                    annonce
                )
            );
        }
    );

    container.appendChild(
        fragment
    );
}


/* =========================================================
   8. SUPPRIMER
   ========================================================= */

async function supprimerAnnonce(
    idAnnonce,
    titre
) {

    const confirmation =
        confirm(
            `Voulez-vous vraiment supprimer "${titre}" ?`
        );

    if (!confirmation) {
        return;
    }


    try {

        const response =
            await fetch(
                API_SUPPRIMER,
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            id_annonce:
                                Number(idAnnonce)
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Erreur lors de la suppression."
            );
        }


        alert(
            "L'annonce a été supprimée avec succès."
        );


        await chargerMesAnnonces();

    } catch (erreur) {

        console.error(erreur);

        alert(
            erreur.message ||
            "Impossible de supprimer l'annonce."
        );
    }
}


/* =========================================================
   9. RECHARGER LES ANNONCES
   ========================================================= */

async function chargerMesAnnonces() {

    const container =
        document.getElementById(
            "mesAnnoncesContainer"
        );

    if (!container) {
        return;
    }


    container.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                Chargement de vos annonces...
            </td>
        </tr>
    `;


    mesAnnonces =
        await obtenirMesAnnonces();


    afficherMesAnnonces();
}


/* =========================================================
   10. OUVRIR MODIFICATION
   ========================================================= */

function modifierAnnonce(idAnnonce) {

    window.location.href =
        `modifier.html?id=${idAnnonce}`;
}


/* =========================================================
   11. RÉCUPÉRER ID DEPUIS URL
   ========================================================= */

function obtenirIdDepuisURL() {

    const parametres =
        new URLSearchParams(
            window.location.search
        );

    const id =
        parametres.get("id");

    if (!id) {
        return null;
    }

    return Number(id);
}


/* =========================================================
   12. RÉCUPÉRER UNE ANNONCE MYSQL PAR ID
   ========================================================= */

function obtenirAnnonceParId(id) {

    return mesAnnonces.find(
        function (annonce) {

            return Number(
                annonce.id_annonce
            ) === Number(id);
        }
    );
}


/* =========================================================
   13. ÉLÉMENTS DU FORMULAIRE
   ========================================================= */

const formulaireModifier =
    document.getElementById(
        "modifierForm"
    );

const annonceIdInput =
    document.getElementById(
        "annonceId"
    );

const titreInput =
    document.getElementById(
        "titre"
    );

const prixInput =
    document.getElementById(
        "prix"
    );

const villeInput =
    document.getElementById(
        "ville"
    );

const categorieInput =
    document.getElementById(
        "categorie"
    );

const modeInput =
    document.getElementById(
        "mode"
    );

const etatInput =
    document.getElementById(
        "etat"
    );

const ageInput =
    document.getElementById(
        "age"
    );

const descriptionInput =
    document.getElementById(
        "description"
    );

const telephoneInput =
    document.getElementById(
        "telephone"
    );

const imagesInput =
    document.getElementById(
        "images"
    );

const imagesContainer =
    document.getElementById(
        "imagesContainer"
    );

const nouvellesImagesContainer =
    document.getElementById(
        "nouvellesImagesContainer"
    );

const prixContainer =
    document.getElementById(
        "prixContainer"
    );


/* =========================================================
   14. NORMALISER
   ========================================================= */

function normaliserValeur(valeur) {

    if (
        valeur === null ||
        valeur === undefined
    ) {
        return "";
    }

    return String(valeur)
        .trim()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase();
}


/* =========================================================
   15. SÉLECTIONNER OPTION
   ========================================================= */

function selectionnerOption(
    select,
    valeur
) {

    if (!select) {
        return;
    }

    const valeurNormalisee =
        normaliserValeur(
            valeur
        );


    for (
        const option of select.options
    ) {

        if (
            normaliserValeur(
                option.value
            ) === valeurNormalisee
        ) {

            option.selected =
                true;

            return;
        }
    }

    console.warn(
        `Valeur "${valeur}" introuvable dans #${select.id}`
    );
}


/* =========================================================
   16. REMPLIR LE FORMULAIRE
   ========================================================= */

function remplirFormulaireModification(
    annonce
) {

    if (
        !annonce ||
        !formulaireModifier
    ) {
        return;
    }


    /* ID */

    annonceIdInput.value =
        annonce.id_annonce;


    /* TITRE */

    titreInput.value =
        annonce.titre || "";


    /* VILLE */

    selectionnerOption(
        villeInput,
        annonce.ville
    );


    /* CATÉGORIE */

    selectionnerOption(
        categorieInput,
        annonce.categorie
    );


    /* MODE */

    selectionnerOption(
        modeInput,
        annonce.mode
    );


    /* ÉTAT */

    selectionnerOption(
        etatInput,
        annonce.etat
    );


    /* ÂGE */

    selectionnerOption(
        ageInput,
        annonce.age
    );


    /* DESCRIPTION */

    descriptionInput.value =
        annonce.description || "";


    /* TÉLÉPHONE */

    telephoneInput.value =
        annonce.telephone || "";


    /* PRIX */

    if (
        annonce.prix !== null &&
        annonce.prix !== undefined
    ) {

        prixInput.value =
            annonce.prix;

    } else {

        prixInput.value =
            "";
    }


    /* PRIX SELON MODE */

    gererPrixModification();


    /* PHOTOS */

    afficherImagesModification(
        annonce
    );
}


/* =========================================================
   17. GESTION PRIX
   ========================================================= */

function gererPrixModification() {

    if (
        !modeInput ||
        !prixInput
    ) {
        return;
    }


    if (
        modeInput.value === "Échange"
    ) {

        prixContainer.style.display =
            "none";

        prixInput.value =
            "";

        prixInput.removeAttribute(
            "required"
        );

    } else {

        prixContainer.style.display =
            "block";

        prixInput.setAttribute(
            "required",
            "required"
        );
    }
}


/* =========================================================
   18. CHANGEMENT MODE
   ========================================================= */

if (modeInput) {

    modeInput.addEventListener(
        "change",
        gererPrixModification
    );
}


/* =========================================================
   19. IMAGES EXISTANTES
   ========================================================= */

function afficherImagesModification(
    annonce
) {

    if (!imagesContainer) {
        return;
    }

    imagesContainer.replaceChildren();


    const images =
        Array.isArray(annonce.images)
            ? annonce.images
            : [];


    if (images.length === 0) {

        const message =
            document.createElement("p");

        message.textContent =
            "Aucune photo.";

        message.className =
            "text-muted";

        imagesContainer.appendChild(
            message
        );

        return;
    }


    images.forEach(
        function (imageData) {

            const wrapper =
                document.createElement("div");

            wrapper.style.position =
                "relative";


            const image =
                document.createElement("img");


            /*
               MySQL renvoie normalement :
               {
                   chemin: "uploads/annonces/...",
                   principale: true
               }
            */

            const chemin =
                typeof imageData === "string"
                    ? imageData
                    : imageData.chemin;


            image.src =
                chemin || "";


            image.alt =
                annonce.titre || "Photo";


            image.style.width =
                "120px";

            image.style.height =
                "120px";

            image.style.objectFit =
                "cover";

            image.style.borderRadius =
                "10px";


            wrapper.appendChild(
                image
            );


            imagesContainer.appendChild(
                wrapper
            );
        }
    );
}


/* =========================================================
   20. APERÇU NOUVELLES IMAGES
   ========================================================= */

if (imagesInput) {

    imagesInput.addEventListener(
        "change",
        function () {

            afficherApercuNouvellesImages(
                imagesInput.files
            );
        }
    );
}


function afficherApercuNouvellesImages(
    fichiers
) {

    if (!nouvellesImagesContainer) {
        return;
    }


    nouvellesImagesContainer.replaceChildren();


    if (
        !fichiers ||
        fichiers.length === 0
    ) {
        return;
    }


    Array.from(fichiers).forEach(
        function (fichier) {

            if (
                !fichier.type.startsWith(
                    "image/"
                )
            ) {
                return;
            }


            const image =
                document.createElement("img");


            image.alt =
                fichier.name;


            image.style.width =
                "120px";

            image.style.height =
                "120px";

            image.style.objectFit =
                "cover";

            image.style.borderRadius =
                "10px";


            const lecteur =
                new FileReader();


            lecteur.onload =
                function (event) {

                    image.src =
                        event.target.result;
                };


            lecteur.readAsDataURL(
                fichier
            );


            nouvellesImagesContainer.appendChild(
                image
            );
        }
    );
}


/* =========================================================
   21. ENREGISTRER MODIFICATION MYSQL
   ========================================================= */

async function enregistrerModification() {

    const id =
        Number(
            annonceIdInput.value
        );


    if (!id) {

        alert(
            "ID annonce invalide."
        );

        return;
    }


    const formulaire =
        new FormData();


    /* =====================================================
       ENVOYER LES VALEURS ACTUELLES DU FORMULAIRE
       ===================================================== */

    formulaire.append(
        "id_annonce",
        id
    );

    formulaire.append(
        "titre",
        titreInput.value.trim()
    );

    formulaire.append(
        "description",
        descriptionInput.value.trim()
    );

    formulaire.append(
        "ville",
        villeInput.value
    );

    formulaire.append(
        "categorie",
        categorieInput.value
    );

    formulaire.append(
        "mode",
        modeInput.value
    );

    formulaire.append(
        "etat",
        etatInput.value
    );

    formulaire.append(
        "age",
        ageInput.value
    );

    formulaire.append(
        "telephone",
        telephoneInput.value.trim()
    );


    /* =====================================================
       PRIX
       ===================================================== */

    if (
        modeInput.value === "Vente"
    ) {

        formulaire.append(
            "prix",
            prixInput.value
        );

    } else {

        formulaire.append(
            "prix",
            ""
        );
    }


    /* =====================================================
       PHOTOS
       ===================================================== */

    /*
       IMPORTANT :

       Si aucune nouvelle photo n'est sélectionnée,
       on n'envoie PAS "images".

       Le PHP gardera donc les anciennes photos.

       Si l'utilisateur choisit de nouvelles photos,
       elles remplaceront les anciennes.
    */

    if (
        imagesInput &&
        imagesInput.files &&
        imagesInput.files.length > 0
    ) {

        Array.from(
            imagesInput.files
        ).forEach(
            function (fichier) {

                formulaire.append(
                    "images[]",
                    fichier
                );
            }
        );
    }


    try {

        const response =
            await fetch(
                API_MODIFIER,
                {
                    method: "POST",

                    credentials: "include",

                    body: formulaire
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Erreur lors de la modification."
            );
        }


        alert(
            "Annonce modifiée avec succès !"
        );


        window.location.href =
            "mes_annonces.html";


    } catch (erreur) {

        console.error(
            erreur
        );

        alert(
            erreur.message ||
            "Impossible de modifier l'annonce."
        );
    }
}


/* =========================================================
   22. VALIDATION
   ========================================================= */

if (formulaireModifier) {

    formulaireModifier.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* TÉLÉPHONE */

            const telephone =
                telephoneInput.value.trim();


            if (
                !/^[0-9]{10}$/.test(
                    telephone
                )
            ) {

                alert(
                    "Le numéro WhatsApp doit contenir exactement 10 chiffres."
                );

                telephoneInput.focus();

                return;
            }


            /* PRIX */

            if (
                modeInput.value === "Vente"
            ) {

                if (
                    prixInput.value === "" ||
                    Number(
                        prixInput.value
                    ) < 0
                ) {

                    alert(
                        "Veuillez saisir un prix valide."
                    );

                    prixInput.focus();

                    return;
                }
            }


            await enregistrerModification();
        }
    );
}


/* =========================================================
   23. INITIALISATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        /*
           ================================================
           PAGE MES ANNONCES
           ================================================
        */

        const container =
            document.getElementById(
                "mesAnnoncesContainer"
            );


        if (container) {

            await chargerMesAnnonces();

            return;
        }


        /*
           ================================================
           PAGE MODIFIER
           ================================================
        */

        if (!formulaireModifier) {
            return;
        }


        /*
           Charger les annonces depuis MySQL
           AVANT de chercher l'annonce par ID.
        */

        mesAnnonces =
            await obtenirMesAnnonces();


        const id =
            obtenirIdDepuisURL();


        if (id === null) {

            alert(
                "Aucune annonce sélectionnée."
            );

            window.location.href =
                "mes_annonces.html";

            return;
        }


        const annonce =
            obtenirAnnonceParId(id);


        if (!annonce) {

            alert(
                "Annonce introuvable."
            );

            window.location.href =
                "mes_annonces.html";

            return;
        }


        console.log(
            "Annonce initiale récupérée depuis MySQL :",
            annonce
        );


        /*
           ICI le formulaire est rempli
           avec les anciennes valeurs.
        */

        remplirFormulaireModification(
            annonce
        );
    }
);