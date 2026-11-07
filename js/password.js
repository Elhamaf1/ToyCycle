// ======================================================
// TOYCYCLE - MOT DE PASSE OUBLIE / VERIFICATION
// password.js
// ======================================================

// PAGE : MOT DE PASSE OUBLIE

const forgotPasswordForm =  document.getElementById("forgotPasswordForm");
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit",async function (event) {
            event.preventDefault();
            console.log("1 - Formulaire envoyé");
            const emailInput = document.getElementById("email");
            const message = document.getElementById("message");
            const button = forgotPasswordForm.querySelector(
                    "button[type='submit']"
                );
            const email = emailInput.value.trim();
            console.log("2 - Email :", email);

            // ------------------------------------------
            // VERIFIER EMAIL
            // ------------------------------------------
            if (email === "") {
                message.textContent = "Veuillez saisir votre adresse email.";
                message.className = "error text-center mb-3";
                return;
            }


            // ------------------------------------------
            // BOUTON
            // ------------------------------------------

            button.disabled = true;

            button.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Envoi en cours...';


            try {

                console.log(
                    "3 - Envoi vers PHP..."
                );


                const response =
                    await fetch(
                        "php/mot_de_passe_oublie.php",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email
                            })
                        }
                    );


                console.log(
                    "4 - Status PHP :",
                    response.status
                );


                // --------------------------------------
                // RECUPERER LA REPONSE BRUTE
                // --------------------------------------

                const texte =
                    await response.text();


                console.log(
                    "5 - Réponse PHP brute :",
                    texte
                );


                // --------------------------------------
                // VERIFIER REPONSE VIDE
                // --------------------------------------

                if (!texte) {

                    message.textContent =
                        "Le serveur n'a retourné aucune réponse.";

                    message.className =
                        "error text-center mb-3";

                    button.disabled = false;

                    button.innerHTML =
                        '<i class="fa-solid fa-envelope"></i> Envoyer le code';

                    return;
                }


                // --------------------------------------
                // CONVERTIR EN JSON
                // --------------------------------------

                let data;

                try {

                    data =
                        JSON.parse(texte);

                } catch (jsonError) {

                    console.error(
                        "Erreur JSON :",
                        jsonError
                    );


                    message.innerHTML =
                        "<strong>Erreur PHP :</strong><br>" +
                        texte;

                    message.className =
                        "error text-center mb-3";

                    button.disabled = false;

                    button.innerHTML =
                        '<i class="fa-solid fa-envelope"></i> Envoyer le code';

                    return;
                }


                console.log(
                    "6 - Données reçues :",
                    data
                );


                // --------------------------------------
                // SUCCESS
                // --------------------------------------

                if (data.success) {

                    message.textContent =
                        data.message;

                    message.className =
                        "success text-center mb-3";


                    // Sauvegarder email
                    sessionStorage.setItem(
                        "reset_email",
                        email
                    );


                    console.log(
                        "7 - Email enregistré dans sessionStorage"
                    );


                    // ----------------------------------
                    // REDIRECTION
                    // ----------------------------------

                    setTimeout(function () {

                        console.log(
                            "8 - Redirection verification.html"
                        );

                        window.location.href =
                            "verification.html";

                    }, 1500);


                } else {

                    message.textContent =
                        data.message;

                    message.className =
                        "error text-center mb-3";


                    button.disabled = false;

                    button.innerHTML =
                        '<i class="fa-solid fa-envelope"></i> Envoyer le code';
                }


            } catch (error) {

                console.error(
                    "ERREUR FETCH :",
                    error
                );


                message.textContent =
                    "Erreur de communication avec le serveur : " +
                    error.message;

                message.className =
                    "error text-center mb-3";


                button.disabled = false;

                button.innerHTML =
                    '<i class="fa-solid fa-envelope"></i> Envoyer le code';
            }

        }
    );

}



// ======================================================
// PAGE : VERIFICATION
// ======================================================

const verificationForm =
    document.getElementById("verificationForm");


if (verificationForm) {

    verificationForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const codeInput =
                document.getElementById(
                    "verificationCode"
                );

            const nouveauMotDePasse =
                document.getElementById(
                    "nouveauMotDePasse"
                );

            const confirmerMotDePasse =
                document.getElementById(
                    "confirmerMotDePasse"
                );

            const message =
                document.getElementById(
                    "message"
                );


            const code =
                codeInput.value.trim();

            const nouveau =
                nouveauMotDePasse.value;

            const confirmation =
                confirmerMotDePasse.value;


            const email =
                sessionStorage.getItem(
                    "reset_email"
                );


            // ------------------------------------------
            // EMAIL
            // ------------------------------------------

            if (!email) {

                message.textContent =
                    "Votre session de récupération a expiré.";

                message.className =
                    "error text-center mb-3";

                setTimeout(function () {

                    window.location.href =
                        "mot_de_passe_oublie.html";

                }, 1500);

                return;
            }


            // ------------------------------------------
            // CODE
            // ------------------------------------------

            if (!/^\d{6}$/.test(code)) {

                message.textContent =
                    "Le code doit contenir exactement 6 chiffres.";

                message.className =
                    "error text-center mb-3";

                return;
            }


            // ------------------------------------------
            // MOT DE PASSE
            // ------------------------------------------

            if (nouveau.length < 8) {

                message.textContent =
                    "Le mot de passe doit contenir au moins 8 caractères.";

                message.className =
                    "error text-center mb-3";

                return;
            }


            // ------------------------------------------
            // CONFIRMATION
            // ------------------------------------------

            if (nouveau !== confirmation) {

                message.textContent =
                    "Les deux mots de passe ne correspondent pas.";

                message.className =
                    "error text-center mb-3";

                return;
            }


            try {

                const response =
                    await fetch(
                        "php/verification.php",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email: email,

                                code: code,

                                nouveau_mot_de_passe:
                                    nouveau

                            })
                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    message.textContent =
                        data.message;

                    message.className =
                        "success text-center mb-3";


                    sessionStorage.removeItem(
                        "reset_email"
                    );


                    setTimeout(function () {

                        window.location.href =
                            "se_connecter.html";

                    }, 1500);


                } else {

                    message.textContent =
                        data.message;

                    message.className =
                        "error text-center mb-3";

                }


            } catch (error) {

                console.error(
                    "Erreur :",
                    error
                );

                message.textContent =
                    "Impossible de communiquer avec le serveur.";

                message.className =
                    "error text-center mb-3";
            }

        }
    );

}



// ======================================================
// AFFICHER / CACHER LES MOTS DE PASSE
// ======================================================

const togglePasswords =
    document.querySelectorAll(
        ".toggle-password"
    );


togglePasswords.forEach(function (togglePassword) {

    togglePassword.addEventListener(
        "click",
        function () {

            const targetId =
                this.dataset.target;

            const passwordInput =
                document.getElementById(targetId);


            if (!passwordInput) {
                return;
            }


            if (passwordInput.type === "password") {

                passwordInput.type = "text";

                this.classList.remove(
                    "fa-eye"
                );

                this.classList.add(
                    "fa-eye-slash"
                );

            } else {

                passwordInput.type = "password";

                this.classList.remove(
                    "fa-eye-slash"
                );

                this.classList.add(
                    "fa-eye"
                );
            }

        }
    );

});