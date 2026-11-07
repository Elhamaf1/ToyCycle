<?php
// ============================================================
// TOYCYCLE - PAGE ACCUEIL
// PHP + MYSQL
// ============================================================
// Cette page :
//   1. Récupère les catégories actives depuis la base de données
//      (avec le nombre d'annonces disponibles par catégorie)
//   2. Détermine si l'utilisateur est connecté
//   3. Affiche le squelette HTML — les listes d'annonces
//      (dernières, échange, vente) sont chargées en AJAX
//      par js/accueil.js via php/annonces.php et php/favoris.php
// ============================================================

session_start();
require_once __DIR__ . "/php/connexion.php";


// ============================================================
// 1. RÉCUPÉRER LES CATÉGORIES ACTIVES + NOMBRE D'ANNONCES
// ============================================================

try {

    $sqlCategories = "
        SELECT
            c.id_categorie,
            c.nom_categorie,
            c.image_categorie,
            COUNT(a.id_annonce) AS nb_annonces
        FROM categorie c
        LEFT JOIN annonce a
            ON a.id_categorie = c.id_categorie
           AND a.id_statut = (
                SELECT id_statut
                FROM statut_annonce
                WHERE nom_statut = 'Disponible'
                LIMIT 1
           )
        WHERE c.statut = 'active'
        GROUP BY c.id_categorie
        ORDER BY c.nom_categorie ASC
    ";

    $stmtCategories = $pdo->query($sqlCategories);
    $categories = $stmtCategories->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {

    // En cas d'erreur, on affiche simplement une page sans catégories
    // plutôt que de faire planter la page d'accueil.
    $categories = [];
}


// ============================================================
// 2. ÉTAT DE CONNEXION DE L'UTILISATEUR
// ============================================================

$estConnecte = isset($_SESSION["id_utilisateur"]);
$prenomUtilisateur = $estConnecte ? ($_SESSION["prenom"] ?? "") : "";


// ============================================================
// 3. ICÔNES PAR DÉFAUT (utilisées si aucune image_categorie
//    n'est définie en base)
// ============================================================

$iconesParDefaut = [
    "Lego"               => "fa-solid fa-cubes",
    "Puzzles"             => "fa-solid fa-puzzle-piece",
    "Jeux éducatifs"      => "fa-solid fa-graduation-cap",
    "Livres"              => "fa-solid fa-book",
    "Peluches"            => "fa-solid fa-teddy-bear",
    "Véhicules"           => "fa-solid fa-car",
    "Jeux de société"     => "fa-solid fa-dice",
    "Jeux électroniques"  => "fa-solid fa-gamepad",
    "Bébé"                => "fa-solid fa-baby",
    "Construction"        => "fa-solid fa-trowel",
    "Sport"               => "fa-solid fa-futbol",
    "Plein air"           => "fa-solid fa-tree",
];

function toycycle_icone(string $nomCategorie, array $icones): string
{
    return $icones[$nomCategorie] ?? "fa-solid fa-shapes";
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ToyCycle - Donnez une seconde vie aux jouets</title>

    <!-- Polices -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">

    <!-- CSS du site -->
    <link rel="stylesheet" href="css/style.css">

</head>
<body>

<?php
    // La navbar est un fichier partagé entre toutes les pages.
    // Elle lit elle-même $estConnecte / $_SESSION si besoin.
    include __DIR__ . "/includes/navbar.php";
?>


<!-- ============================================================
     HERO + RECHERCHE
============================================================ -->
<section class="hero">
    <div class="container text-center">

        <h1>Donnez une seconde vie aux jouets</h1>
        <p>Achetez, échangez ou donnez des jouets partout au Maroc</p>

        <?php if ($estConnecte): ?>
            <p class="hero-welcome">
                Bon retour, <?php echo htmlspecialchars($prenomUtilisateur); ?> 👋
            </p>
        <?php endif; ?>

        <form id="accueilSearchForm" class="heroSearchForm">
            <input
                type="text"
                id="accueilSearchInput"
                placeholder="Rechercher un jouet, une marque..."
                autocomplete="off">

            <button type="submit" aria-label="Rechercher">
                <i class="fa-solid fa-magnifying-glass"></i>
            </button>
        </form>

    </div>
</section>


<!-- ============================================================
     CATÉGORIES (rendues côté PHP depuis la base de données)
============================================================ -->
<section class="categoriesSection py-5">
    <div class="container">

        <h2 class="text-center mb-4">Catégories</h2>

        <?php if (empty($categories)): ?>

            <p class="text-center">Aucune catégorie disponible pour le moment.</p>

        <?php else: ?>

            <div class="row g-4">

                <?php foreach ($categories as $cat): ?>

                    <div class="col-lg-2 col-md-3 col-6">

                        <a
                            href="annonces.html?categorie=<?php echo urlencode($cat['nom_categorie']); ?>"
                            class="category-card text-decoration-none"
                            data-id-categorie="<?php echo (int) $cat['id_categorie']; ?>">

                            <?php if (!empty($cat['image_categorie'])): ?>

                                <img
                                    src="<?php echo htmlspecialchars($cat['image_categorie']); ?>"
                                    alt="<?php echo htmlspecialchars($cat['nom_categorie']); ?>"
                                    class="categoryImage">

                            <?php else: ?>

                                <i class="<?php echo toycycle_icone($cat['nom_categorie'], $iconesParDefaut); ?>"></i>

                            <?php endif; ?>

                            <h5><?php echo htmlspecialchars($cat['nom_categorie']); ?></h5>

                            <span class="categoryCount">
                                <?php echo (int) $cat['nb_annonces']; ?> annonce<?php echo $cat['nb_annonces'] > 1 ? 's' : ''; ?>
                            </span>

                        </a>

                    </div>

                <?php endforeach; ?>

            </div>

        <?php endif; ?>

    </div>
</section>


<!-- ============================================================
     DERNIÈRES ANNONCES (chargées en AJAX par accueil.js)
============================================================ -->
<section class="dernieresSection py-5">
    <div class="container">

        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Dernières annonces</h2>
            <a href="annonces.html" class="voirBtn">Voir tout</a>
        </div>

        <div class="row g-4" id="latestContainer">
            <div class="col-12 text-center py-4">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p>Chargement des annonces...</p>
            </div>
        </div>

    </div>
</section>


<!-- ============================================================
     À ÉCHANGER
============================================================ -->
<section class="echangeSection py-5">
    <div class="container">

        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>À échanger</h2>
            <a href="annonces.html?type=Échange" class="voirBtn">Voir tout</a>
        </div>

        <div class="row g-4" id="echangeContainer"></div>

    </div>
</section>


<!-- ============================================================
     À VENDRE
============================================================ -->
<section class="venteSection py-5">
    <div class="container">

        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>À vendre</h2>
            <a href="annonces.html?type=Vente" class="voirBtn">Voir tout</a>
        </div>

        <div class="row g-4" id="venteContainer"></div>

    </div>
</section>


<?php include __DIR__ . "/includes/footer.php"; ?>


<!-- Scripts -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="js/accueil.js"></script>

</body>
</html>
