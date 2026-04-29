console.log("Script 1 executed from Chrome extension.");

const existingBox = document.getElementById("script-runner-test-box");

if (existingBox) {
  existingBox.remove();
}

const box = document.createElement("div");
box.id = "script-runner-test-box";
box.textContent = "Script executed successfully";

box.style.position = "fixed";
box.style.top = "20px";
box.style.left = "20px";
box.style.zIndex = "999999";
box.style.padding = "16px";
box.style.backgroundColor = "red";
box.style.color = "white";
box.style.fontSize = "18px";
box.style.fontWeight = "bold";
box.style.border = "4px solid black";
box.style.borderRadius = "8px";

document.body.appendChild(box);

document.documentElement.style.outline = "6px solid red";