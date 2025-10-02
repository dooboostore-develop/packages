import { DomRender } from '@dooboostore/dom-render/DomRender';

export class TimerExample {
  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const demoDiv = document.createElement('div');
    demoDiv.className = 'demo-box';
    demoDiv.innerHTML = `
      <h3>Timer Component</h3>
      <p style="color: #666; margin-bottom: 20px;">
        Using <code>dr-timer</code> for countdown timers
      </p>
      
      <!-- Example 1: Simple Countdown -->
      <div style="margin-bottom: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px;">
        <h4 style="color: #0284c7; margin-bottom: 15px;">Example 1: Simple Countdown Timer</h4>
        
        <dr-timer value="5" interval="1000" dr-option-component-variable-name="timer">
          <div style="text-align: center; margin-bottom: 15px;">
            <div style="font-size: 48px; font-weight: bold; color: #0284c7; font-family: monospace;">
              \${#timer#.value !== undefined ? #timer#.value : '--'}$
            </div>
            <div style="font-size: 14px; color: #666; margin-top: 5px;">
              milliseconds remaining (interval 1000)
            </div>
          </div>
          
          <div style="text-align: center;">
            <button dr-event-click="#timer#.start()" style="padding: 8px 16px; margin-right: 8px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">
              ▶️ Start
            </button>
            <button dr-event-click="#timer#.stop()" style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
              ⏹️ Stop
            </button>
          </div>
          
          <div dr-if="#timer#.timeSecond === 0" style="margin-top: 15px; padding: 15px; background: #d1fae5; border-radius: 4px; text-align: center; font-weight: bold; color: #065f46;">
            ⏰ Time's Up!
          </div>
        </dr-timer>
      </div>

      <!-- Example 2: Pomodoro Timer -->
      <div style="margin-bottom: 30px; padding: 20px; background: #fef3c7; border-radius: 8px;">
        <h4 style="color: #d97706; margin-bottom: 15px;">Example 2: Pomodoro Timer (25 min)</h4>
        
        <dr-timer value="1500" dr-option-component-variable-name="timer">
          <div style="text-align: center; margin-bottom: 15px;">
            <div style="font-size: 56px; font-weight: bold; color: #d97706; font-family: monospace;">
              \${#timer#.value !== undefined ? Math.floor(#timer#.value / 60).toString().padStart(2, '0') : '--'}$:\${#timer#.value !== undefined ? (#timer#.value % 60).toString().padStart(2, '0') : '--'}$
            </div>
            <div style="font-size: 14px; color: #666; margin-top: 5px;">
              minutes : seconds
            </div>
          </div>
          
          <div style="text-align: center; margin-bottom: 15px;">
            <div style="background: white; border-radius: 8px; padding: 10px; display: inline-block;">
              <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Progress</div>
              <div style="width: 300px; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden;">
                <div 
                style="height: 100%; background: #d97706; border-radius: 4px; transition: width 1s linear;"
                dr-style="{width: #timer#.value !== undefined ? ((1500 - #timer#.value) / 1500 * 100)+'%' : '0%'}"
                >
                </div>
              </div>
            </div>
          </div>
          
          <div style="text-align: center;">
            <button dr-event-click="#timer#.start()" dr-if="!@this@.isRunning()" style="padding: 10px 24px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold;">
              ▶️ Start Focus Session
            </button>
            <button dr-event-click="#timer#.stop()" dr-if="@this@.isRunning()" style="padding: 10px 24px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold;">
              ⏹️ Stop
            </button>
          </div>
          
          <div dr-if="@this@.timeSecond === 0" style="margin-top: 15px; padding: 20px; background: white; border-radius: 4px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 10px;">🎉</div>
            <div style="font-weight: bold; color: #065f46; font-size: 18px;">
              Great job! Take a 5-minute break.
            </div>
          </div>
        </dr-timer>
      </div>

      <!-- Example 3: Multiple Timers -->
      <div style="margin-bottom: 30px; padding: 20px; background: #f3e8ff; border-radius: 8px;">
        <h4 style="color: #9333ea; margin-bottom: 15px;">Example 3: Multi-Timer System</h4>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
          <!-- Timer 1 -->
          <dr-timer timeSecond="30">
            <div style="padding: 15px; background: white; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Quick Task</div>
              <div style="font-size: 32px; font-weight: bold; color: #9333ea; font-family: monospace; margin-bottom: 10px;">
                \${@this@.timeSecond !== undefined ? @this@.timeSecond : '30'}$s
              </div>
              <button dr-event-click="@this@.start()" dr-if="!@this@.isRunning()" style="padding: 4px 12px; background: #9333ea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%;">
                Start
              </button>
              <button dr-event-click="@this@.stop()" dr-if="@this@.isRunning()" style="padding: 4px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%;">
                Stop
              </button>
            </div>
          </dr-timer>
          
          <!-- Timer 2 -->
          <dr-timer timeSecond="60">
            <div style="padding: 15px; background: white; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Short Break</div>
              <div style="font-size: 32px; font-weight: bold; color: #06b6d4; font-family: monospace; margin-bottom: 10px;">
                \${@this@.timeSecond !== undefined ? @this@.timeSecond : '60'}$s
              </div>
              <button dr-event-click="@this@.start()" dr-if="!@this@.isRunning()" style="padding: 4px 12px; background: #06b6d4; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%;">
                Start
              </button>
              <button dr-event-click="@this@.stop()" dr-if="@this@.isRunning()" style="padding: 4px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%;">
                Stop
              </button>
            </div>
          </dr-timer>
          
          <!-- Timer 3 -->
          <dr-timer timeSecond="120">
            <div style="padding: 15px; background: white; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Extended</div>
              <div style="font-size: 32px; font-weight: bold; color: #ec4899; font-family: monospace; margin-bottom: 10px;">
                \${@this@.timeSecond !== undefined ? Math.floor(@this@.timeSecond / 60) : '2'}$:\${@this@.timeSecond !== undefined ? (@this@.timeSecond % 60).toString().padStart(2, '0') : '00'}$
              </div>
              <button dr-event-click="@this@.start()" dr-if="!@this@.isRunning()" style="padding: 4px 12px; background: #ec4899; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%;">
                Start
              </button>
              <button dr-event-click="@this@.stop()" dr-if="@this@.isRunning()" style="padding: 4px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%;">
                Stop
              </button>
            </div>
          </dr-timer>
        </div>
      </div>
    `;
    output.appendChild(demoDiv);

    // Initialize DomRender
    const result = new DomRender({
      rootObject: {},
      target: demoDiv,
      config: { window }
    });


  }
}
