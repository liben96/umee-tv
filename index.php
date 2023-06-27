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
    <link href="./assets/css/flatpickr.min.css" rel="stylesheet">
    <link href="./assets/css/style.css?v=<?= time() ?>"
        rel="stylesheet">
    </link>
    <?php
    require_once __DIR__. '/vendor/autoload.php'; // Include the Composer autoloader

    // Load the environment file
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__.'/');
    $dotenv->load();

    ini_set('session.gc_maxlifetime', $_ENV['SESSION_TIMEOUT']);
    session_set_cookie_params($_ENV['SESSION_TIMEOUT']);
    ini_set('session.cookie_samesite', 'None');
    ini_set('session.cookie_secure', 'true');
    session_start();
    if(!isset($_SESSION['userId'])) : ?>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f7f7f7;
        }

        .card {
            width: 400px;
            padding: 20px;
            background-color: #fff;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 120px;
        }

        .card h2 {
            text-align: center;
            color: #333;
        }

        .form-control {
            border-color: #ddd;
        }

        .form-control:focus {
            border-color: #009688;
            box-shadow: 0 0 0 0.2rem rgba(0, 150, 136, 0.25);
        }

        .form-check-label {
            color: #666;
        }

        .btn-primary {
            background-color: #009688;
            border-color: #009688;
        }

        .btn-primary:hover {
            background-color: #008077;
            border-color: #008077;
        }

        .btn-primary:focus {
            box-shadow: 0 0 0 0.2rem rgba(0, 150, 136, 0.5);
        }
    </style>
    <?php endif; ?>
    <!-- styles end -->
</head>

<body>
    <?php if(!isset($_SESSION['userId'])): ?>
    <div class="card">
        <div class="text-center">
            <img src=" ./assets/images/umee_smile_allblack.png" class="mb-4" style="width:140px;" alt="umee-logo">
        </div>
        <form id="login-form">
            <div class="mb-3">
                <label for="username" class="form-label">Username*</label>
                <input type="text" class="form-control" id="username" name="username" placeholder="Enter username"
                    required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password*</label>
                <input type="password" class="form-control" id="password" name="password" placeholder="Enter password"
                    autocomplete required>
            </div>
            <div class="d-flex align-items-center mt-4">
                <button id="login-submit-button" type="submit" class="btn btn-dark"><span class="loader d-none">
                        <i class="fa fa-spinner fa-spin"></i>
                    </span><span id="login-submit-text">Login</span></button>
                <div class="text-end flex-grow-1"><a href="javascript:void(0)" onclick="toggleResetForm()">Forgot your
                        password?</a></div>
            </div>
        </form>
        <form id="reset-form" class="d-none" onsubmit="return submitResetForm(event)">
            <div class="mb-3">
                <label for="reset-email" class="form-label">Email*</label>
                <input name="reset-email" type="email" class="form-control" id="reset-email"
                    placeholder="Enter email of your account" required>
            </div>
            <div id="reset-code-section" class="d-none">
                <div class="mb-3">
                    <label for="reset-code" class="form-label">Code*</label>
                    <input type="text" class="form-control" id="reset-code" name="reset-code"
                        placeholder="Enter code sent to your email" required>
                </div>
                <div class="mb-3">
                    <label for="reset-password" class="form-label">Password*</label>
                    <input type="password" class="form-control" id="reset-password" name="reset-password"
                        placeholder="Enter password" autocomplete required>
                </div>
                <div class="mb-3">
                    <label for="reset-confirm-password" class="form-label">Cofirm Password*</label>
                    <input type="password" class="form-control" id="reset-confirm-password"
                        name="reset-confirm-password" placeholder="Re-Enter password" autocomplete required>
                </div>
            </div>
            <div id="reset-alert" class="alert alert-success fade show d-none" role="alert">
                <span id="reset-alert-text"></span>
            </div>
            <div class="d-flex align-items-center mt-4">
                <button id="reset-submit-button" type="submit" class="btn btn-dark"><span class="loader d-none">
                        <i class="fa fa-spinner fa-spin"></i>
                    </span><span id="reset-submit-text">Send</span></button>
                <div class="text-end flex-grow-1"><a href="javascript:void(0)" onclick="toggleResetForm()">Back to
                        Login</a></div>
            </div>
        </form>
    </div>
    <?php else: ?>

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
                            <div class="">
                                <button type="button" id="add-channel" class="btn btn-sm btn-dark ms-2 d-none">Add
                                    Channel</button>
                            </div>
                        </div>
                        <div id="channels-stats" class="text-small d-flex align-items-center d-none">
                            <button id="filter-online" onclick="filterTable('online')"
                                class="btn btn-light btn-sm btn-filter border me-2"><i
                                    class="fa-solid fa-circle text-success"></i> <span id="channels-online"></span>
                            </button>
                            <button id="filter-disabled" onclick="filterTable('disabled')"
                                class="btn btn-light border btn-sm btn-filter me-2"><i
                                    class="fa-solid fa-circle text-secondary"></i>
                                <span id="channels-disabled"></span>
                            </button>
                            <button id="filter-error" onclick="filterTable('error')"
                                class="btn btn-light border btn-sm btn-filter me-2"><i
                                    class="fa-solid fa-circle text-danger"></i>
                                <span id="channels-error"></span>
                            </button>
                            <button id="filter-delay" onclick="filterTable('delay')"
                                class="btn btn-light border btn-sm btn-filter"><i
                                    class="fa-solid fa-circle text-flusonic"></i>
                                <span id="channels-delay"></span>
                            </button>
                            <button onclick="filterTable('')" id="filter-clear"
                                class="btn btn-light border btn-sm d-none ms-2" data-bs-toggle="popover"
                                data-bs-trigger="hover" data-bs-placement="top" data-bs-content="Clear filters"><i
                                    class="fa-solid fa-filter-circle-xmark"></i>
                            </button>
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

    <!-- Modal for channel edit -->
    <div id="edit-modal" class="modal fade">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 745px;">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 id="form-title" class="modal-title fs-5" id="staticBackdropLabel">Edit Channel</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form id="edit-form">
                    <div class="modal-body">
                        <div class="row mb-1">
                            <label for="input_logo" class="col-sm-2 col-form-label"></label>
                            <div class="col-sm-10 d-flex align-items-center">
                                <img id="input_logo" src="./assets/images/no-logo.png" class="channel-logo me-2"
                                    alt="channel-logo">
                                <button type="button" id="logo_clear"
                                    class="btn btn-light btn-sm btn-filter border me-2 d-none"><i
                                        class="fa-solid fa-xmark"></i></button>
                                <input id="input_logo_input" class="form-control" type="file" name="image" id="image"
                                    accept="image/*" />
                            </div>
                        </div>
                        <div class="row mb-1 d-none">
                            <label for="input_id" class="col-sm-2 col-form-label text-end">ID</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" id="input_id" readonly>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_name" class="col-sm-2 col-form-label text-end">Number*</label>
                            <div class="col-sm-10">
                                <input type="number" class="form-control" id="input_name" name="input_name" required>
                                <span id="input_name_error" class="text-danger"></span>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_channelName" class="col-sm-2 col-form-label">Name*</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" id="input_channelName" name="input_channelName"
                                    required>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_typeSourceId" class="col-sm-2 col-form-label">Source</label>
                            <div class="col-sm-10">
                                <select id="input_typeSourceId" class="form-select" aria-label="Source">
                                </select>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_typeOTTId" class="col-sm-2 col-form-label">OTT</label>
                            <div class="col-sm-10">
                                <select id="input_typeOTTId" class="form-select" aria-label="OTT">
                                </select>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_ip" class="col-sm-2 col-form-label">IP</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" id="input_ip">
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_typePVIId" class="col-sm-2 col-form-label">PVI</label>
                            <div class="col-sm-10">
                                <div class="row">
                                    <div class="col-sm-5">
                                        <select id="input_typePVIId" class="form-select" aria-label="PVI">
                                        </select>
                                    </div>
                                    <div class="col-sm-7">
                                        <div class="row">
                                            <label for="input_pviPort" class="col-sm-3 col-form-label">Port</label>
                                            <div class="col-sm-9">
                                                <input type="number" class="form-control" id="input_pviPort">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_typePDUId" class="col-sm-2 col-form-label">PDU</label>
                            <div class="col-sm-10">
                                <div class="row">
                                    <div class="col-sm-5">
                                        <select id="input_typePDUId" class="form-select" aria-label="PDU">
                                        </select>
                                    </div>
                                    <div class="col-sm-7">
                                        <div class="row">
                                            <label for="input_pduPort" class="col-sm-3 col-form-label">Port</label>
                                            <div class="col-sm-9">
                                                <input type="number" class="form-control" id="input_pduPort">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_box" class="col-sm-2 col-form-label">Box</label>
                            <div class="col-sm-10">
                                <div class="row">
                                    <div class="col-sm-5">
                                        <input type="text" class="form-control" id="input_box">
                                    </div>
                                    <div class="col-sm-7">
                                        <div class="row">
                                            <label for="input_rack" class="col-sm-3 col-form-label">Rack</label>
                                            <div class="col-sm-9">
                                                <input type="text" class="form-control" id="input_rack">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_cardNumber" class="col-sm-2 col-form-label">Card Number</label>
                            <div class="col-sm-10">
                                <div class="row">
                                    <div class="col-sm-5">
                                        <input type="text" class="form-control" id="input_cardNumber">
                                    </div>
                                    <div class="col-sm-7">
                                        <div class="row">
                                            <label for="input_cardNumberExpiry"
                                                class="col-sm-3 col-form-label">Expiry</label>
                                            <div class="col-sm-9">
                                                <input type="text" class="form-control" id="input_cardNumberExpiry">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_typeEscalationId" class="col-sm-2 col-form-label">Escalation</label>
                            <div class="col-sm-10">
                                <div class="row">
                                    <div class="col-sm-5">
                                        <select id="input_typeEscalationId" class="form-select" aria-label="Escalation">
                                        </select>
                                    </div>
                                    <div class="col-sm-7">
                                        <!-- <div class="row">
                                                <label for="input_wikiUrl" class="col-sm-3 col-form-label">Wiki</label>
                                                <div class="col-sm-9">
                                                    <input type="text" class="form-control" id="input_wikiUrl">
                                                </div>
                                            </div> -->
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_wikiUrl" class="col-sm-2 col-form-label">Wiki</label>
                            <div class="col-sm-10 has-icon">
                                <input type="text" class="form-control" id="input_wikiUrl">
                                <a id="wiki-href" target="_blank" href="javascript:void(0)" class="input-icon"><i
                                        class="fa-solid fa-arrow-up-right-from-square"></i></a>
                            </div>
                        </div>
                        <div class="row">
                            <label for="input_priority" class="col-2 col-form-label">Priority</label>
                            <div class="col-10">
                                <input type="checkbox" class="form-check-input" id="input_priority"
                                    style="padding: 0.32rem 0.4rem;">
                            </div>
                        </div>
                        <div class="row">
                            <label for="input_enabled" class="col-2 col-form-label">Enabled</label>
                            <div class="col-10">
                                <input type="checkbox" class="form-check-input" id="input_enabled"
                                    style="padding: 0.32rem 0.4rem;">
                            </div>
                        </div>
                        <div id="edit-alert" class="alert alert-success fade show mb-0 mt-2 d-none" role="alert">
                            <span id="edit-alert-text"></span>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary" id="channel-submit-button"><span
                                class="loader d-none">
                                <i class="fa fa-spinner fa-spin"></i>
                            </span>Save</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div id="confirm-modal" class="modal fade">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 id="form-title" class="modal-title fs-5" id="staticBackdropLabel">Confirmation</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">

                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-dark" id="confirm-submit" onclick="submitChannelAction()"><span
                            class="loader d-none">
                            <i class="fa fa-spinner fa-spin"></i>
                        </span>Confirm</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
    <div id="confirm-delete-modal" class="modal fade">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 id="form-title" class="modal-title fs-5" id="staticBackdropLabel">Confirmation <span
                            class="confirmation-count">1</span></h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">

                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-danger" id="confirm-delete-submit" onclick="deleteChannel()">
                        <span class="loader d-none">
                            <i class="fa fa-spinner fa-spin"></i></span>
                        <span class="confirm-button-text">Confirm</span>
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
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
    <script src="./assets/js/flatpickr.js"></script>
    <script src="./assets/js/moment.min.js"></script>
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
    <script src="./src/app.js?v=<?= time() ?>"></script>
    <!-- scripts end -->
</body>

</html>