const API = "https://your-backend-api.com/api/users"; // Replace with actual

export const getAllUsers = async () => {
  const res = await fetch(API);
  return await res.json();
};

export const createUser = async (user) => {
  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
};

export const updateUser = async (id, user) => {
  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
};

export const deleteUser = async (id) => {
  await fetch(`${API}/${id}`, { method: "DELETE" });
};
