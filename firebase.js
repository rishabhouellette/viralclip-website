<!-- Firebase SDKs (COMPAT – REQUIRED FOR HTML PROJECTS) -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>

<script>
  const firebaseConfig = {
    apiKey: "AIzaSyDD07e_IYaWSGUwybGpZWtZ6cEJzCX6kcc",
    authDomain: "viralcliptech-36846.firebaseapp.com",
    projectId: "viralcliptech-36846",
    storageBucket: "viralcliptech-36846.firebasestorage.app",
    messagingSenderId: "128287408309",
    appId: "1:128287408309:web:776a5f93888d995f54fefc",
    measurementId: "G-M8DMS26YDC"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  window.auth = firebase.auth();
  window.db = firebase.firestore();
</script>
