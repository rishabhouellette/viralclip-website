document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.replace("/dashboard.html");
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
};
