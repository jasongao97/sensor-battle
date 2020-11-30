const playground = new p5((p) => {
  let cars = {};

  p.setup = function () {
    const win = document.getElementById("playground");
    p.createCanvas(win.clientWidth, win.clientHeight);

    p.rectMode(p.CENTER);
    p.textAlign(p.CENTER);
    p.textSize(14);
    p.textStyle(p.BOLD);

    // ["g", "j", "m", "r", "s"].forEach((e) => {
    //   cars[e] = new Car(0, 0, e);
    // });
  };

  p.windowResized = function () {
    const win = document.getElementById("playground");
    p.resizeCanvas(win.clientWidth, win.clientHeight);
  };

  p.draw = function () {
    p.background(220);

    p.translate(p.width / 2, p.height / 2);

    if (!Object.keys(cars).length) {
      p.text('Send any command to start...', 0, 0)
    }

    for (player in cars) {
      cars[player].draw();
    }
  };

  p.exe = function (player, action) {
    if (!cars[player]) cars[player] = new Car(0, 0, player);
    switch (action) {
      case "go":
        cars[player].y -= p.cos(cars[player].angle) * 2;
        cars[player].x += p.sin(cars[player].angle) * 2;
        break;
      case "back":
        cars[player].y += p.cos(cars[player].angle) * 2;
        cars[player].x -= p.sin(cars[player].angle) * 2;
        break;
      case "left":
        cars[player].angle -= 0.05;
        break;
      case "right":
        cars[player].angle += 0.05;
        break;
      case "fire":
        cars[player].fire();
        break;
    }
  };

  class Car {
    constructor(x, y, name) {
      this.x = x;
      this.y = y;
      this.name = name;
      this.angle = 0;
      this.balls = [];
    }

    draw() {
      p.fill(220);
      p.stroke(0);
      p.strokeWeight(2);

      p.push();

      p.translate(this.x, this.y);
      p.rotate(this.angle);

      // body
      p.rect(0, 0, 30, 40);

      // wheels
      p.rect(-18, -10, 6, 10);
      p.rect(18, -10, 6, 10);
      p.rect(-18, 10, 6, 10);
      p.rect(18, 10, 6, 10);

      // cannon
      p.rect(0, -15, 10, 20);

      // name
      p.fill(0);
      p.noStroke();
      p.text(this.name[0].toUpperCase(), 0, 12);

      p.pop();

      this.balls.forEach((ball, index) => {
        ball.move();
        ball.draw();
        if (ball.isOut()) {
          this.balls.splice(index, 1);
        }
      });
    }

    fire() {
      const ballX = this.x + p.sin(this.angle) * 25;
      const ballY = this.y - p.cos(this.angle) * 25;
      this.balls.push(new Particle(ballX, ballY, this.angle));
    }
  }

  class Particle {
    constructor(x, y, angle) {
      this.x = x;
      this.y = y;
      this.angle = angle;
    }

    draw() {
      p.fill(0);
      p.noStroke();
      p.ellipse(this.x, this.y, 6);
    }

    move() {
      this.y -= p.cos(this.angle) * 2;
      this.x += p.sin(this.angle) * 2;
    }

    isOut() {
      return (
        this.x < -p.width / 2 - 5 ||
        this.x > p.width / 2 + 5 ||
        this.y < -p.height / 2 - 5 ||
        this.y > p.height / 2 + 5
      );
    }
  }
}, "playground");
