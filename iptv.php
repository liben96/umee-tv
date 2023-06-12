<?php session_start(); ?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>u-mee TV Admin</title>
    <link rel="icon" type="image/x-icon" href="./assets/images/favicon.ico">

    <!-- styles start -->
    <link href="./assets/css/bootstrap.min.css" rel="stylesheet">
    </link>
    <link href="./assets/css/datatables.min.css" rel="stylesheet">
    </link>
    <link href="./assets/css/fontawesome/css/fontawesome.min.css" rel="stylesheet">
    <link href="./assets/css/fontawesome/css/brands.min.css" rel="stylesheet">
    <link href="./assets/css/fontawesome/css/solid.min.css" rel="stylesheet">
    <link href="./assets/css/style.css?v=<?= time() ?>"
        rel="stylesheet">
    </link>
</head>

<body>
    <nav id="navbar" class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll"
                aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
                <i class="fa-solid fa-bars"></i>
            </button>
            <a class="navbar-brand" href="./"><img src="./assets/images/umee_smile_allwhite.png" class="umee-logo"
                    alt="umee-logo"></a>
            <div class="collapse navbar-collapse" id="navbarScroll">
            </div>
            <div class="right-buttons">
                <div>
                    <?php echo $_SESSION['userFullName']?>
                    (<?php echo $_SESSION['role']?>)
                </div>
                <div><button type="button" id="logout" class="btn button light" onclick="logout()">Logout</button></div>
            </div>
        </div>
    </nav>

    <!-- Revert to index if not logged in and not roleId 1 -->
    <?php if (!isset($_SESSION["userId"]) || !isset($_SESSION["roleId"]) || $_SESSION["roleId"] != 1) {
        header("location: index.php");
    }?>

    <?php if(isset($_SESSION['userId'])) : ?>
    <div id="main-loader" class="d-none">
        <div class="text-center mt-3">
            <h4>
                <span class="loader">
                    <i class="fa fa-spinner fa-spin"></i>
                </span>Loading...
            </h4>
        </div>
    </div>
    <div id="main-area">
        <div class="container-fluid">
            <div class="row">
                <div class="col">
                    <div class="d-flex border-bottom flex-column flex-md-row gap-2 pb-2">
                        <div class="d-flex align-items-center flex-grow-1">
                            <div class="has-icon table-search-container">
                                <input id="table-search" type="text" class="form-control"
                                    placeholder="Type to search" />
                                <a id="search-clear" href="javascript:void(0)" class="input-icon d-none text-dark"><i
                                        class="fa-solid fa-xmark"></i></i></a>
                            </div>
                        </div>
                    </div>
                    <table class="table nowrap table-striped dt-responsive" id="tv-list" style="width:100%">
                    </table>
                </div>
            </div>
            <footer class="mt-3">
                <div class="row">
                    <div class="mt-2 col text-end">
                        <p class="mr-3 m-0"> © u-mee&nbsp;<span class="current-year"></span>. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    </div>
    <?php endif; ?>

    <!-- notification -->
    <div id="notification-container" class="position-fixed">
        <div id="notification" class="toast align-items-center text-white border-0" role="alert" aria-live="assertive"
            aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body"></div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"
                    aria-label="Close"></button>
            </div>
        </div>
    </div>

    <!-- scripts start -->
    <script src="./assets/js/jquery-3.7.0.min.js"></script>
    <script src="./assets/js/jquery.validate.min.js"></script>
    <script src="./assets/js/bootstrap.bundle.min.js"></script>
    <script src="./assets/js/datatables.min.js"></script>
    <script type="text/javascript">
        // prettier-ignore
        let userId = '<?php if(isset($_SESSION['userId'])) {
            echo $_SESSION['userId'];
        } else {
            echo null;
        } ?>'
        if (userId) userId = parseFloat(userId);
        // prettier-ignore
        let roleId = '<?php if(isset($_SESSION['roleId'])) {
            echo $_SESSION['roleId'];
        } else {
            echo null;
        } ?>'
        if (roleId) roleId = parseFloat(roleId);
    </script>
    <script src="./src/common.js?v=<?= time() ?>"></script>
    <script src="./src/iptv.js?v=<?= time() ?>"></script>
    <!-- scripts end -->
</body>

</html>