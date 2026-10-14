const keyMap = {
  ArrowUp: 'throttle',
  w: 'throttle',
  ArrowDown: 'brake',
  s: 'brake',
  ArrowLeft: 'left',
  a: 'left',
  ArrowRight: 'right',
  d: 'right'
};

export class InputController {
  constructor() {
    this.held = new Set();
    this.pressed = new Set();
    this.touchHeld = new Set();
    window.addEventListener('keydown', (event) => {
      if (keyMap[event.key] || ['Escape', 'r'].includes(event.key)) event.preventDefault();
      this.held.add(event.key);
      this.pressed.add(event.key);
    });
    window.addEventListener('keyup', (event) => this.held.delete(event.key));
    document.querySelectorAll('[data-control]').forEach((button) => {
      const control = button.dataset.control;
      const start = (event) => { event.preventDefault(); this.touchHeld.add(control); };
      const end = (event) => { event.preventDefault(); this.touchHeld.delete(control); };
      button.addEventListener('pointerdown', start);
      button.addEventListener('pointerup', end);
      button.addEventListener('pointercancel', end);
      button.addEventListener('pointerleave', end);
    });
  }

  sample() {
    const has = (name) => [...this.held].some((key) => keyMap[key] === name) || this.touchHeld.has(name);
    const input = {
      throttle: has('throttle') ? 1 : 0,
      brake: has('brake') ? 1 : 0,
      steering: (has('right') ? 1 : 0) - (has('left') ? 1 : 0),
      resetPressed: this.pressed.has('r'),
      pausePressed: this.pressed.has('Escape')
    };
    this.pressed.clear();
    return input;
  }
}
