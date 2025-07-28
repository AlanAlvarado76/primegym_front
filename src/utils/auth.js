// utils/auth.js

export const isAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const adminRoleId = "68703a8cbe19d4a7e175ea1a"; // ID de Admin

    if (!user?.roles) return false;

    return user.roles.includes(adminRoleId);
  } catch {
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login"; 
};
