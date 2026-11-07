// ======================================================
// TOYCYCLE - PROFIL
// Utilisé par : profil.html + modpro.html
// ======================================================
// ======================================================
// UTILISATEUR CONNECTÉ
// RÉCUPÉRÉ DEPUIS LA SESSION PHP / MYSQL
// ======================================================

let utilisateur = null;
// ======================================================
// ÉLÉMENTS DE profil.html
// ======================================================
const imageprofil = document.getElementById("imageprofil" );
const nom = document.getElementById("nom");
const prenom = document.getElementById("prenom");
const email = document.getElementById("email");
const ville = document.getElementById("ville");
const telephone = document.getElementById("telephone");

// ======================================================
// ÉLÉMENTS DE modpro.html
// ======================================================
const formprofil = document.getElementById( "formModifierProfil" );
const nomInput = document.getElementById( "nomInput" );
const prenomInput = document.getElementById( "prenomInput" );
const emailInput = document.getElementById( "emailInput" );
const villeInput = document.getElementById( "villeInput" );
const telephoneInput = document.getElementById("telephoneInput");
const photoInput = document.getElementById("photoInput");
const previewPhoto = document.getElementById("previewPhoto");

// ======================================================
// RÉCUPÉRER LE PROFIL DEPUIS PHP / MYSQL
// ======================================================

async function recupererProfil() {

    try {

        const response = await fetch(
            "php/profil.php",
            {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Veuillez vous connecter."
            );

            window.location.href =
                "se_connecter.html";

            return;
        }

        utilisateur =
            data.utilisateur;

        afficherProfil();

        remplirFormulaire();

    } catch (error) {

        console.error(
            "Erreur profil :",
            error
        );

        alert(
            "Impossible de communiquer avec le serveur."
        );
    }
}

// ======================================================
// AFFICHER LE PROFIL
// ======================================================
function afficherProfil() {
    if (!utilisateur) {
        return;
    }
    if (imageprofil) {
        imageprofil.src = utilisateur.photo_profil ||  "images/profil.webp";
    }
    if (nom) {
        nom.textContent = utilisateur.nom;
    }
    if (prenom) {
        prenom.textContent = utilisateur.prenom;
    }
    if (email) {
        email.textContent = utilisateur.email;
    }
    if (ville) {
        ville.textContent = utilisateur.ville;
    }
    if (telephone) {
        telephone.textContent = utilisateur.telephone;
    }
}

// ======================================================
// REMPLIR modpro.html
// ======================================================
function remplirFormulaire() {
    if (!formprofil || !utilisateur) {
        return;
    }
    nomInput.value = utilisateur.nom;
    prenomInput.value = utilisateur.prenom;
    emailInput.value = utilisateur.email;
    villeInput.value = utilisateur.ville;
    telephoneInput.value = utilisateur.telephone;
    // Afficher la photo actuelle
    if (previewPhoto) {

        previewPhoto.src =
            utilisateur.photo_profil ||
            "images/profil.webp";
    }
}
// ======================================================
// PRÉVISUALISATION DE LA PHOTO
// ======================================================

if (photoInput) {

    photoInput.addEventListener("change", function () {

        const fichier = this.files[0];

        if (!fichier) {
            return;
        }

        // Vérifier que c'est une image
        if (!fichier.type.startsWith("image/")) {

            alert("Veuillez sélectionner une image.");

            this.value = "";

            return;
        }

        // Prévisualiser l'image
        const reader = new FileReader();

        reader.onload = function (event) {

            if (previewPhoto) {
                previewPhoto.src =
                    event.target.result;
            }
        };

        reader.readAsDataURL(fichier);
    });
}
// ======================================================
// ENREGISTRER modpro.html
// ======================================================

if (formprofil) {

    formprofil.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // ==================================================
            // RÉCUPÉRER LES VALEURS
            // ==================================================

            const nomValue =
                nomInput.value.trim();

            const prenomValue =
                prenomInput.value.trim();

            const emailValue =
                emailInput.value.trim();

            const villeValue =
                villeInput.value;

            const telephoneValue =
                telephoneInput.value.trim();


            // ==================================================
            // PRÉPARER LES DONNÉES
            // ==================================================

            const formData = new FormData();

            formData.append("nom", nomValue);
            formData.append("prenom", prenomValue);
            formData.append("email", emailValue);
            formData.append("ville", villeValue);
            formData.append("telephone", telephoneValue);


            // ==================================================
            // AJOUTER LA PHOTO SI ELLE A ÉTÉ CHOISIE
            // ==================================================

            if (
                photoInput &&
                photoInput.files.length > 0
            ) {

                formData.append(
                    "photo",
                    photoInput.files[0]
                );
            }


            // ==================================================
            // ENVOYER À PHP
            // ==================================================

            try {

                const response =
                    await fetch(
                        "php/profil.php",
                        {
                            method: "POST",

                            credentials: "include",

                            body: formData
                        }
                    );


                const data =
                    await response.json();


                // ==================================================
                // ERREUR
                // ==================================================

                if (!response.ok || !data.success) {

                    alert(
                        data.message ||
                        "Impossible de modifier le profil."
                    );

                    return;
                }


                // ==================================================
                // SUCCÈS
                // ==================================================

                alert(
                    "Profil modifié avec succès !"
                );


                window.location.href =
                    "profil.html";


            } catch (error) {

                console.error(
                    "Erreur modification :",
                    error
                );

                alert(
                    "Impossible de communiquer avec le serveur."
                );
            }
        }
    );
}


// ======================================================
// INITIALISATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {
        recupererProfil();
    }
);

// ======================================================
// SUPPRIMER LE PROFIL ET SES ANNONCES
// ======================================================

const boutonSupprimer =
    document.getElementById(
        "supprimerProfil"
    );


if (boutonSupprimer) {

    boutonSupprimer.addEventListener(
        "click",
        async function() {


            // ==================================================
            // CONFIRMATION
            // ==================================================

            const confirmation =
                confirm(
                    "Voulez-vous vraiment supprimer votre compte ?\n\n" +
                    "Votre profil et toutes vos annonces publiées " +
                    "seront définitivement supprimés."
                );


            if (!confirmation) {
                return;
            }


            // ==================================================
            // SUPPRIMER DANS MYSQL
            // ==================================================

            try {

                const response =
                    await fetch(
                        "php/profil.php",
                        {
                            method: "DELETE",
                            credentials: "include"
                        }
                    );


                const data =
                    await response.json();


                // ==================================================
                // ERREUR
                // ==================================================

                if (!response.ok || !data.success) {

                    alert(
                        data.message ||
                        "Impossible de supprimer le compte."
                    );

                    return;
                }


                // ==================================================
                // SUCCÈS
                // ==================================================

                alert(
                    "Votre compte et toutes vos annonces " +
                    "ont été supprimés."
                );


                // ==================================================
                // RETOUR ACCUEIL
                // ==================================================

                window.location.href =
                    "accueil.html";


            } catch (error) {

                console.error(
                    "Erreur suppression :",
                    error
                );

                alert(
                    "Impossible de communiquer avec le serveur."
                );
            }
        }
    );
}