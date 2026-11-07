// ======================================================
// TOYCYCLE - PAGE CONTACT
// PHP + MYSQL
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Page Contact chargée.");


    // ==================================================
    // 1. RÉCUPÉRER LE FORMULAIRE
    // ==================================================

    const contactForm =
        document.getElementById("loginForm");

    if (!contactForm) {

        console.error(
            "Erreur : le formulaire #loginForm est introuvable."
        );

        return;
    }


    // ==================================================
    // 2. RÉCUPÉRER LES CHAMPS
    // ==================================================

    const prenom =
        document.getElementById("prenom");

    const nom =
        document.getElementById("nom");

    const email =
        document.getElementById("email");

    const sujet =
        document.getElementById("sujet");

    const message =
        document.getElementById("message");


    // ==================================================
    // 3. AFFICHER UNE ERREUR
    // ==================================================

    function afficherErreur(champ, texte) {

        supprimerErreur(champ);

        const erreur =
            document.createElement("div");

        erreur.className =
            "contact-error";

        erreur.textContent =
            texte;

        champ.insertAdjacentElement(
            "afterend",
            erreur
        );

        champ.classList.add(
            "is-invalid"
        );
    }


    // ==================================================
    // 4. SUPPRIMER UNE ERREUR
    // ==================================================

    function supprimerErreur(champ) {

        champ.classList.remove(
            "is-invalid"
        );

        const erreur =
            champ.nextElementSibling;

        if (
            erreur &&
            erreur.classList.contains(
                "contact-error"
            )
        ) {

            erreur.remove();
        }
    }


    // ==================================================
    // 5. MESSAGE DE SUCCÈS
    // ==================================================

    function afficherSucces(texte) {

        const ancienMessage =
            document.querySelector(
                ".contact-success"
            );

        if (ancienMessage) {
            ancienMessage.remove();
        }


        const succes =
            document.createElement("div");

        succes.className =
            "contact-success";


        succes.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <span>${texte}</span>
        `;


        contactForm.insertAdjacentElement(
            "afterend",
            succes
        );
    }


    // ==================================================
    // 6. VALIDATION PRÉNOM
    // ==================================================

    function validerPrenom() {

        const valeur =
            prenom.value.trim();


        if (valeur === "") {

            afficherErreur(
                prenom,
                "Veuillez saisir votre prénom."
            );

            return false;
        }


        if (valeur.length < 2) {

            afficherErreur(
                prenom,
                "Le prénom doit contenir au moins 2 caractères."
            );

            return false;
        }


        const regex =
            /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;


        if (!regex.test(valeur)) {

            afficherErreur(
                prenom,
                "Le prénom contient des caractères invalides."
            );

            return false;
        }


        supprimerErreur(prenom);

        return true;
    }


    // ==================================================
    // 7. VALIDATION NOM
    // ==================================================

    function validerNom() {

        const valeur =
            nom.value.trim();


        if (valeur === "") {

            afficherErreur(
                nom,
                "Veuillez saisir votre nom."
            );

            return false;
        }


        if (valeur.length < 2) {

            afficherErreur(
                nom,
                "Le nom doit contenir au moins 2 caractères."
            );

            return false;
        }


        const regex =
            /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;


        if (!regex.test(valeur)) {

            afficherErreur(
                nom,
                "Le nom contient des caractères invalides."
            );

            return false;
        }


        supprimerErreur(nom);

        return true;
    }


    // ==================================================
    // 8. VALIDATION EMAIL
    // ==================================================

    function validerEmail() {

        const valeur =
            email.value.trim();


        if (valeur === "") {

            afficherErreur(
                email,
                "Veuillez saisir votre adresse e-mail."
            );

            return false;
        }


        const regex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!regex.test(valeur)) {

            afficherErreur(
                email,
                "Veuillez saisir une adresse e-mail valide."
            );

            return false;
        }


        supprimerErreur(email);

        return true;
    }


    // ==================================================
    // 9. VALIDATION SUJET
    // ==================================================

    function validerSujet() {

        const valeur =
            sujet.value.trim();


        if (valeur === "") {

            afficherErreur(
                sujet,
                "Veuillez choisir un sujet."
            );

            return false;
        }


        supprimerErreur(sujet);

        return true;
    }


    // ==================================================
    // 10. VALIDATION MESSAGE
    // ==================================================

    function validerMessage() {

        const valeur =
            message.value.trim();


        if (valeur === "") {

            afficherErreur(
                message,
                "Veuillez écrire votre message."
            );

            return false;
        }


        if (valeur.length < 10) {

            afficherErreur(
                message,
                "Le message doit contenir au moins 10 caractères."
            );

            return false;
        }


        if (valeur.length > 1000) {

            afficherErreur(
                message,
                "Le message ne doit pas dépasser 1000 caractères."
            );

            return false;
        }


        supprimerErreur(message);

        return true;
    }


    // ==================================================
    // 11. COMPTEUR DE CARACTÈRES
    // ==================================================

    const compteur =
        document.createElement("small");

    compteur.className =
        "message-counter";

    compteur.textContent =
        "0 / 1000 caractères";


    message.insertAdjacentElement(
        "afterend",
        compteur
    );


    function mettreAJourCompteur() {

        const longueur =
            message.value.length;


        compteur.textContent =
            `${longueur} / 1000 caractères`;


        if (longueur >= 900) {

            compteur.classList.add(
                "warning"
            );

        } else {

            compteur.classList.remove(
                "warning"
            );
        }
    }


    message.addEventListener(
        "input",
        mettreAJourCompteur
    );


    // ==================================================
    // 12. VALIDATION EN TEMPS RÉEL
    // ==================================================

    prenom.addEventListener(
        "blur",
        validerPrenom
    );

    nom.addEventListener(
        "blur",
        validerNom
    );

    email.addEventListener(
        "blur",
        validerEmail
    );

    sujet.addEventListener(
        "change",
        validerSujet
    );

    message.addEventListener(
        "blur",
        validerMessage
    );


    // ==================================================
    // 13. ENLEVER LES ERREURS PENDANT LA SAISIE
    // ==================================================

    prenom.addEventListener(
        "input",
        function () {

            if (prenom.value.trim() !== "") {
                supprimerErreur(prenom);
            }

        }
    );


    nom.addEventListener(
        "input",
        function () {

            if (nom.value.trim() !== "") {
                supprimerErreur(nom);
            }

        }
    );


    email.addEventListener(
        "input",
        function () {

            if (email.value.trim() !== "") {
                supprimerErreur(email);
            }

        }
    );


    sujet.addEventListener(
        "change",
        function () {

            if (sujet.value !== "") {
                supprimerErreur(sujet);
            }

        }
    );


    message.addEventListener(
        "input",
        function () {

            if (message.value.trim() !== "") {
                supprimerErreur(message);
            }

        }
    );


    // ==================================================
    // 14. ENVOYER LE FORMULAIRE
    // ==================================================

    contactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ------------------------------------------
            // VALIDATION
            // ------------------------------------------

            const prenomValide =
                validerPrenom();

            const nomValide =
                validerNom();

            const emailValide =
                validerEmail();

            const sujetValide =
                validerSujet();

            const messageValide =
                validerMessage();


            if (
                !prenomValide ||
                !nomValide ||
                !emailValide ||
                !sujetValide ||
                !messageValide
            ) {

                return;
            }


            // ------------------------------------------
            // BOUTON
            // ------------------------------------------

            const bouton =
                contactForm.querySelector(
                    ".register-btn"
                );


            bouton.disabled = true;


            bouton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Envoi en cours...
            `;


            // ------------------------------------------
            // DONNÉES
            // ------------------------------------------

            const donnees = {

                prenom:
                    prenom.value.trim(),

                nom:
                    nom.value.trim(),

                email:
                    email.value.trim(),

                sujet:
                    sujet.value,

                message:
                    message.value.trim()
            };


            // ------------------------------------------
            // ENVOI PHP
            // ------------------------------------------

            try {

                const response =
                    await fetch(
                        "php/contact.php",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(donnees)
                        }
                    );


                const resultat =
                    await response.json();


                // --------------------------------------
                // SUCCÈS
                // --------------------------------------

                if (resultat.success) {

                    afficherSucces(
                        resultat.message
                    );


                    contactForm.reset();


                    mettreAJourCompteur();


                } else {

                    alert(
                        resultat.message
                    );
                }


            } catch (erreur) {

                console.error(
                    "Erreur :",
                    erreur
                );


                alert(
                    "Impossible de communiquer avec le serveur."
                );


            } finally {

                bouton.disabled = false;


                bouton.innerHTML = `
                    <i class="fa-solid fa-paper-plane"></i>
                    Envoyer le message
                `;
            }

        }
    );

});