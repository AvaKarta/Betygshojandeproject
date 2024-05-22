class Player {
  constructor({ x, y, radius, color, username }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.username = username;
  }

  draw() {
    ctx.font = "20px sans-serif";
    ctx.fillStyle = "white";
    ctx.fillText(
      this.username,
      this.x - ctx.measureText(this.username).width / 2,
      this.y - this.radius - 10
    );
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
