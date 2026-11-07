/* ============================================================
   TOYCYCLE - PUBLICATION D'UNE ANNONCE
   Fichier : publier.js

   Fonctionnement :
   - Validation du formulaire
   - Compteur de caractères
   - Affichage / masquage du prix
   - Prévisualisation des images
   - Envoi vers PHP
   - Le PHP récupère l'utilisateur via la session
   - Le PHP récupère le téléphone depuis utilisateur.telephone
   - Le PHP enregistre l'annonce dans MySQL
============================================================ */

document.addEventListener("DOMContentLoaded", function () {

    /* ========================================================
       1. ÉLÉMENTS
    ======================================================== */

    const form = document.getElementById("publicationForm");

    const titre = document.getElementById("titre");
    const mode = document.getElementById("mode");
    const categorie = document.getElementById("categorie");
    const etat = document.getElementById("etat");
    const description = document.getElementById("description");
    const age = document.getElementById("age");
    const prix = document.getElementById("prix");
    const ville = document.getElementById("ville");
    const images = document.getElementById("images");

    const imagePreview =
        document.getElementById("imagePreview");

    const counter =
        document.getElementById("counter");

    const prixContainer =
        document.getElementById("prixContainer");


    /* ========================================================
       2. VÉRIFIER LE FORMULAIRE
    ======================================================== */

    if (!form) {
        console.error("Le formulaire est introuvable.");
        return;
    }


    /* ========================================================
       3. COMPTEUR DESCRIPTION
    ======================================================== */

    if (description && counter) {

        description.addEventListener("input", function () {

            const longueur =
                description.value.length;

            counter.textContent = longueur;

            if (longueur >= 500) {

                counter.style.color = "red";

            } else if (longueur >= 400) {

                counter.style.color = "orange";

            } else {

                counter.style.color = "";
            }
        });
    }


    /* ========================================================
       4. GESTION DU PRIX

       1 = Vente
       2 = Échange
    ======================================================== */

    function gererPrix() {

        if (mode.value === "2") {

            // Échange
            prixContainer.classList.add("hidden");

            prix.required = false;
            prix.value = "";

            supprimerErreur(prix);

        } else {

            // Vente
            prixContainer.classList.remove("hidden");

            prix.required = true;
        }
    }


    gererPrix();


    mode.addEventListener("change", function () {

        gererPrix();

        supprimerErreur(mode);
    });


    /* ========================================================
       5. GESTION DES IMAGES
    ======================================================== */

    images.addEventListener("change", function () {

        imagePreview.innerHTML = "";

        const fichiers =
            Array.from(images.files);


        /* ----------------------------------------------------
           MAXIMUM 5 IMAGES
        ---------------------------------------------------- */

        if (fichiers.length > 5) {

            afficherErreur(
                images,
                "Vous pouvez sélectionner au maximum 5 images."
            );

            images.value = "";

            return;
        }


        /* ----------------------------------------------------
           VÉRIFICATION
        ---------------------------------------------------- */

        for (const fichier of fichiers) {

            if (!fichier.type.startsWith("image/")) {

                afficherErreur(
                    images,
                    "Veuillez sélectionner uniquement des images."
                );

                images.value = "";

                return;
            }


            const tailleMax =
                5 * 1024 * 1024;


            if (fichier.size > tailleMax) {

                afficherErreur(
                    images,
                    "Chaque image doit faire moins de 5 Mo."
                );

                images.value = "";

                return;
            }
        }


        /* ----------------------------------------------------
           PRÉVISUALISATION
        ---------------------------------------------------- */

        fichiers.forEach(function (fichier) {

            const reader =
                new FileReader();


            reader.onload = function (event) {

                const preview =
                    document.createElement("div");

                preview.classList.add("preview");


                const image =
                    document.createElement("img");

                image.src =
                    event.target.result;

                image.alt =
                    "Image du jouet";


                const boutonSupprimer =
                    document.createElement("button");

                boutonSupprimer.type = "button";

                boutonSupprimer.innerHTML = "×";

                boutonSupprimer.title =
                    "Supprimer cette photo";


                preview.appendChild(image);

                preview.appendChild(
                    boutonSupprimer
                );

                imagePreview.appendChild(
                    preview
                );


                boutonSupprimer.addEventListener(
                    "click",
                    function () {

                        preview.remove();
                    }
                );
            };


            reader.readAsDataURL(fichier);
        });


        supprimerErreur(images);
    });


    /* ========================================================
       6. AFFICHER ERREUR
    ======================================================== */

    function afficherErreur(element, message) {

        supprimerErreur(element);


        const erreur =
            document.createElement("div");

        erreur.className = "js-error";

        erreur.textContent = message;


        element.insertAdjacentElement(
            "afterend",
            erreur
        );
    }


    /* ========================================================
       7. SUPPRIMER ERREUR
    ======================================================== */

    function supprimerErreur(element) {

        if (!element) {
            return;
        }


        const erreur =
            element.nextElementSibling;


        if (
            erreur &&
            erreur.classList.contains("js-error")
        ) {

            erreur.remove();
        }
    }


    /* ========================================================
       8. SUPPRIMER TOUTES LES ERREURS
    ======================================================== */

    function supprimerToutesLesErreurs() {

        document
            .querySelectorAll(".js-error")
            .forEach(function (erreur) {

                erreur.remove();
            });
    }


    /* ========================================================
       9. VALIDATION TITRE
    ======================================================== */

    function validerTitre() {

        const valeur =
            titre.value.trim();


        if (valeur === "") {

            afficherErreur(
                titre,
                "Veuillez donner un titre à votre annonce."
            );

            return false;
        }


        if (valeur.length < 3) {

            afficherErreur(
                titre,
                "Le titre doit contenir au moins 3 caractères."
            );

            return false;
        }


        supprimerErreur(titre);

        return true;
    }


    /* ========================================================
       10. VALIDATION MODE
    ======================================================== */

    function validerMode() {

        if (mode.value === "") {

            afficherErreur(
                mode,
                "Veuillez sélectionner un mode de transaction."
            );

            return false;
        }


        supprimerErreur(mode);

        return true;
    }


    /* ========================================================
       11. VALIDATION CATÉGORIE
    ======================================================== */

    function validerCategorie() {

        if (categorie.value === "") {

            afficherErreur(
                categorie,
                "Veuillez sélectionner une catégorie."
            );

            return false;
        }


        supprimerErreur(categorie);

        return true;
    }


    /* ========================================================
       12. VALIDATION ÉTAT
    ======================================================== */

    function validerEtat() {

        if (etat.value === "") {

            afficherErreur(
                etat,
                "Veuillez sélectionner l'état du jouet."
            );

            return false;
        }


        supprimerErreur(etat);

        return true;
    }


    /* ========================================================
       13. VALIDATION DESCRIPTION
    ======================================================== */

    function validerDescription() {

        const valeur =
            description.value.trim();


        if (valeur === "") {

            afficherErreur(
                description,
                "Veuillez décrire votre jouet."
            );

            return false;
        }


        if (valeur.length < 10) {

            afficherErreur(
                description,
                "La description doit contenir au moins 10 caractères."
            );

            return false;
        }


        if (valeur.length > 500) {

            afficherErreur(
                description,
                "La description ne doit pas dépasser 500 caractères."
            );

            return false;
        }


        supprimerErreur(description);

        return true;
    }


    /* ========================================================
       14. VALIDATION ÂGE
    ======================================================== */

    function validerAge() {

        if (age.value === "") {

            afficherErreur(
                age,
                "Veuillez sélectionner l'âge recommandé."
            );

            return false;
        }


        supprimerErreur(age);

        return true;
    }


    /* ========================================================
       15. VALIDATION PRIX
    ======================================================== */

    function validerPrix() {

        // Échange
        if (mode.value === "2") {

            supprimerErreur(prix);

            return true;
        }


        const valeur =
            prix.value.trim();


        if (valeur === "") {

            afficherErreur(
                prix,
                "Veuillez indiquer le prix du jouet."
            );

            return false;
        }


        const prixNombre =
            Number(valeur);


        if (
            isNaN(prixNombre) ||
            prixNombre <= 0
        ) {

            afficherErreur(
                prix,
                "Le prix doit être supérieur à 0 DH."
            );

            return false;
        }


        supprimerErreur(prix);

        return true;
    }


    /* ========================================================
       16. VALIDATION VILLE
    ======================================================== */

    function validerVille() {

        if (ville.value === "") {

            afficherErreur(
                ville,
                "Veuillez sélectionner votre ville."
            );

            return false;
        }


        supprimerErreur(ville);

        return true;
    }


    /* ========================================================
       17. VALIDATION IMAGES
    ======================================================== */

    function validerImages() {

        if (images.files.length === 0) {

            afficherErreur(
                images,
                "Veuillez ajouter au moins une image."
            );

            return false;
        }


        if (images.files.length > 5) {

            afficherErreur(
                images,
                "Vous pouvez ajouter au maximum 5 images."
            );

            return false;
        }


        supprimerErreur(images);

        return true;
    }


    /* ========================================================
       18. VALIDATION COMPLÈTE
    ======================================================== */

    function validerFormulaire() {

        const titreOK =
            validerTitre();

        const modeOK =
            validerMode();

        const categorieOK =
            validerCategorie();

        const etatOK =
            validerEtat();

        const descriptionOK =
            validerDescription();

        const ageOK =
            validerAge();

        const prixOK =
            validerPrix();

        const villeOK =
            validerVille();

        const imagesOK =
            validerImages();


        return (
            titreOK &&
            modeOK &&
            categorieOK &&
            etatOK &&
            descriptionOK &&
            ageOK &&
            prixOK &&
            villeOK &&
            imagesOK
        );
    }


    /* ========================================================
       19. VALIDATION EN DIRECT
    ======================================================== */

    titre.addEventListener("input", function () {
        supprimerErreur(titre);
    });


    mode.addEventListener("change", function () {
        supprimerErreur(mode);
    });


    categorie.addEventListener("change", function () {
        supprimerErreur(categorie);
    });


    etat.addEventListener("change", function () {
        supprimerErreur(etat);
    });


    description.addEventListener("input", function () {
        supprimerErreur(description);
    });


    age.addEventListener("change", function () {
        supprimerErreur(age);
    });


    prix.addEventListener("input", function () {
        supprimerErreur(prix);
    });


    ville.addEventListener("change", function () {
        supprimerErreur(ville);
    });


    /* ========================================================
       20. CRÉER FORMDATA

       IMPORTANT :
       Aucun téléphone ici.

       Le PHP récupère :
       $_SESSION["id_utilisateur"]

       puis :
       utilisateur.telephone
    ======================================================== */

    function creerFormData() {

        const formData =
            new FormData();


        formData.append(
            "titre",
            titre.value.trim()
        );


        formData.append(
            "description",
            description.value.trim()
        );


        formData.append(
            "categorie",
            categorie.value
        );


        formData.append(
            "etat",
            etat.value
        );


        formData.append(
            "age",
            age.value
        );


        formData.append(
            "mode",
            mode.value
        );


        formData.append(
            "ville",
            ville.value
        );


        /* ----------------------------------------------------
           PRIX
        ---------------------------------------------------- */

        if (mode.value === "1") {

            formData.append(
                "prix",
                prix.value
            );

        } else {

            formData.append(
                "prix",
                ""
            );
        }


        /* ----------------------------------------------------
           IMAGES
        ---------------------------------------------------- */

        for (
            const fichier of images.files
        ) {

            formData.append(
                "images[]",
                fichier
            );
        }


        return formData;
    }


    /* ========================================================
       21. ENVOYER
    ======================================================== */

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            supprimerToutesLesErreurs();


            /* ------------------------------------------------
               VALIDATION
            ------------------------------------------------ */

            if (!validerFormulaire()) {

                const premiereErreur =
                    document.querySelector(
                        ".js-error"
                    );


                if (premiereErreur) {

                    premiereErreur.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }


                return;
            }


            /* ------------------------------------------------
               FORMDATA
            ------------------------------------------------ */

            const formData =
                creerFormData();


            /* ------------------------------------------------
               ENVOI PHP
            ------------------------------------------------ */

            try {

                const response =
                    await fetch(
                        "php/publier_annonce.php",
                        {
                            method: "POST",

                            credentials: "include",

                            body: formData
                        }
                    );


                const data =
                    await response.json();


                /* ------------------------------------------------
                   ERREUR
                ------------------------------------------------ */

                if (
                    !response.ok ||
                    !data.success
                ) {

                    alert(
                        data.message ||
                        "Impossible de publier l'annonce."
                    );

                    return;
                }


                /* ------------------------------------------------
                   SUCCÈS
                ------------------------------------------------ */

                alert(
                    "Votre annonce a été publiée avec succès !"
                );


                /* ------------------------------------------------
                   RÉINITIALISER
                ------------------------------------------------ */

                form.reset();

                counter.textContent = "0";

                imagePreview.innerHTML = "";

                gererPrix();


                /* ------------------------------------------------
                   REDIRECTION
                ------------------------------------------------ */

                window.location.href =
                    "mes_annonces.html";


            } catch (error) {

                console.error(
                    "Erreur publication :",
                    error
                );


                alert(
                    "Impossible de communiquer avec le serveur."
                );
            }
        }
    );


    console.log(
        "ToyCycle : publier.js chargé avec succès."
    );

});