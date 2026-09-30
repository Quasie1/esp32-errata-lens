// Structured facts transcribed from Espressif's ESP32 Series SoC Errata
// (Chip Revision Identification + Errata Summary tables).
// Source: https://docs.espressif.com/projects/esp-chip-errata/en/latest/esp32/
// Only IDs, titles, categories and revision applicability are stored here.
// The prose (conditions, workarounds) lives in the Knowledge Base.

export const ERRATA_BASE =
  'https://docs.espressif.com/projects/esp-chip-errata/en/latest/esp32/03-errata-description'

export const revisions = [
  // efuse: APB_CTRL_DATE[31], EFUSE_BLK0_RDATA5[20], EFUSE_BLK0_RDATA3[15], RDATA5[25], RDATA5[24]
  {name: 'v0.0', major: 0, minor: 0, chipMarking: 'XXXXXXXX (no letter)', chipMarkingLetter: null, moduleMarking: 'XXXXXX (see eFuse)', efuse: [0, 0, 0, 0, 0]},
  {name: 'v1.0', major: 1, minor: 0, chipMarking: 'X B XXXXXX', chipMarkingLetter: 'B', moduleMarking: 'XXXXXX', efuse: [0, 0, 1, 0, 0]},
  {name: 'v1.1', major: 1, minor: 1, chipMarking: 'X F XXXXXX', chipMarkingLetter: 'F', moduleMarking: 'MF XXXX', efuse: [0, 0, 1, 0, 1]},
  {name: 'v3.0', major: 3, minor: 0, chipMarking: 'X E XXXXXX', chipMarkingLetter: 'E', moduleMarking: 'ME XXXX', efuse: [1, 1, 1, 0, 0]},
  {name: 'v3.1', major: 3, minor: 1, chipMarking: 'X G XXXXXX', chipMarkingLetter: 'G', moduleMarking: 'MG XXXX', efuse: [1, 1, 1, 0, 1]},
]

const ALL = ['v0.0', 'v1.0', 'v1.1', 'v3.0', 'v3.1']

// [id, category, title, affected revisions, url slug]
export const errata = [
  ['CPU-3.5', 'CPU', 'The CPU crashes when the clock frequency switches', ['v0.0'], 'esp32/cpu-crash-of-cpu-when-clock-frequency-switches'],
  ['CPU-3.18', 'CPU', 'CPU has limitations when accessing peripherals in chips', ALL, 'esp32/cpu-limitations-when-accessing-peripherals'],
  ['CPU-3.16', 'CPU', 'Limitations to CPU access to 0x3ff0_0000–0x3ff1_efff and 0x3ff4_0000–0x3ff7_ffff address spaces', ALL, 'esp32/cpu-limited-access-to-address-spaces'],
  ['CPU-3.9', 'CPU', 'Read/write errors when the CPU accesses external SRAM in a certain sequence', ['v1.0', 'v1.1'], 'esp32/cpu-read-and-write-errors-related-to-access-sequence'],
  ['CPU-3.2', 'CPU', 'Read/write errors when the CPU accesses external SRAM through cache under certain conditions', ['v0.0'], 'esp32/cpu-read-and-write-errors-using-cache'],
  ['CPU-3.10', 'CPU', 'Read error when each CPU reads certain different address spaces simultaneously', ['v0.0', 'v1.0', 'v1.1'], 'esp32/cpu-read-error-of-dual-core-cpu'],
  ['CPU-3.21', 'CPU', 'Interrupting the CPU while it accesses five specific FIFO registers halts subsequent accesses', ALL, 'esp32/cpu-subsequent-access-halted-when-get-interrupted'],
  ['CPU-3.3', 'CPU', 'Repeated writes to a single peripheral address may be lost', ['v0.0'], 'esp32/cpu-writes-lost'],
  ['ULP-3.19', 'ULP', 'ULP coprocessor and touch sensors unusable in Deep-sleep if RTC_PERIPH power domain is powered up', ALL, 'esp32/ulp-and-touch-sensors-cannot-be-used'],
  ['GPIO-3.6', 'GPIO', 'GPIO pull-up/pull-down register fields are nonfunctional on pads that also have RTC_GPIO function', ALL, 'esp32/gpio-control-of-gpio-resistors-via-registers'],
  ['GPIO-3.14', 'GPIO', 'Within one GPIO group, edge interrupts cannot be used together with other interrupts', ALL, 'esp32/gpio-edge-interrupts'],
  ['GPIO-3.11', 'GPIO', 'GPIO36 and GPIO39 inputs pulled down ~80 ns when certain RTC peripherals power on', ALL, 'esp32/gpio-inputs-pulled-down'],
  ['RES-3.4', 'Reset', 'Brown-out reset (BOR) does not work', ['v0.0'], 'esp32/reset-bor-function-fails'],
  ['RES-3.1', 'Reset', 'Spurious watchdog reset on power-up or wake from Deep-sleep', ['v0.0'], 'esp32/reset-spurious-watchdog-reset'],
  ['RES-3.8', 'Reset', 'Spurious watchdog reset on power-up or wake from Deep-sleep due to flash start-up time', ['v0.0', 'v1.0', 'v1.1'], 'esp32/reset-watchdog-reset-due-to-flash-startup-time'],
  ['CLK-3.7', 'Clock', 'Audio PLL frequency range is limited', ['v0.0'], 'esp32/clock-limited-audio-pll-frequency-range'],
  ['CLK-3.22', 'Clock', 'ESP32 cannot be the PHY clock source when Wi-Fi and Ethernet are used together', ALL, 'esp32/clock-rmii-clock-when-using-ethernet-and-wifi'],
  ['RTC-126', 'RTC', 'RTC register read error after wake-up from Light-sleep', ALL, 'shared/rtc-reg-read-error-from-light-sleep'],
  ['WDT-3.15', 'Watchdog', 'Live lock under certain conditions causes an interrupt watchdog issue', ['v3.0', 'v3.1'], 'esp32/watchdog-issue-caused-by-live-lock'],
  ['UART-3.17', 'UART', 'UART fifo_cnt does not correctly indicate data length in the FIFO', ALL, 'esp32/uart-fifo-cnt-indicates-data-length-incorrectly'],
  ['TWAI-3.13.6', 'TWAI', 'After losing arbitration, a dominant bit on the 3rd bit of intermission is not treated as SOF', ALL, 'esp32/twai-dominant-bit-not-interpreted-as-sof'],
  ['TWAI-3.13.3', 'TWAI', 'Message transmitted after bus-off recovery is erroneous', ALL, 'esp32/twai-erroneous-message-transmits'],
  ['TWAI-3.13.7', 'TWAI', 'Error passive state not entered when 8th bit of error delimiter is dominant', ALL, 'esp32/twai-error-passive-state-not-entered'],
  ['TWAI-3.13.2', 'TWAI', 'Error status bit is not frozen during bus-off recovery', ALL, 'esp32/twai-error-status-bit-not-frozen'],
  ['TWAI-3.13.5', 'TWAI', 'An erroneous received data frame can invalidate the next frame’s data bytes', ALL, 'esp32/twai-invalid-received-data-frame'],
  ['TWAI-3.13.10', 'TWAI', 'Negative phase error |e| > SJW(N) left-shifts remaining transmitted bits', ALL, 'esp32/twai-negative-phase-error'],
  ['TWAI-3.13.1', 'TWAI', 'Receive Error Counter (REC) can change in reset mode or bus-off recovery', ALL, 'esp32/twai-rec-change'],
  ['TWAI-3.13.11', 'TWAI', 'RX FIFO becomes unrecoverable after overrunning with 64+ messages', ALL, 'esp32/twai-rx-fifo-overruns'],
  ['TWAI-3.13.8', 'TWAI', 'Suspend transmission is included even after losing arbitration', ALL, 'esp32/twai-suspend-transmission'],
  ['TWAI-3.13.9', 'TWAI', 'Stuff error during arbitration as transmitter: later error/overload frame errors don’t increase TEC', ALL, 'esp32/twai-tec-value-not-increased'],
  ['TWAI-3.13.4', 'TWAI', 'Reading the interrupt register may lose a transmit interrupt', ALL, 'esp32/twai-transmit-interrupt-lost'],
  ['LEDC-3.12', 'LEDC', 'Duty overflow error possible in decremental fade mode', ALL, 'esp32/ledc-duty-overflow-error'],
]
