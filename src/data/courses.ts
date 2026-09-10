import { Course } from '../types';

export const CRANES_COURSES: Course[] = [
  {
    id: 'general',
    code: 'CV-GEN',
    title: 'General Inquiries & Admissions',
    category: 'Admissions & Institute Info',
    duration: 'All Inquiries',
    description: 'General assistance about Cranes Varsity, admissions, batch timings, fees, 100% placement record, and campus facilities in Bangalore.',
    highlights: [
      '28+ Years of Academic Excellence (Est. 1996)',
      '50,000+ Engineers Trained & Placed',
      '2000+ Core Tech Hiring Partners (Bosch, Intel, Qualcomm, Samsung, etc.)',
      'Bangalore Centers: Rajajinagar & Jayanagar',
      'Hands-on Hardware Kits & Dedicated Physical Labs'
    ],
    keySkills: ['Admission Guidance', 'Fee Breakdown', 'Placement Cell Support', 'Batch Schedules', 'Eligibility Criteria'],
    sampleQuestions: [
      'What are the eligibility criteria for Cranes Varsity PG Diploma courses?',
      'How does the 100% placement guarantee program work at Cranes Varsity?',
      'What are the upcoming batch dates and fee structures?',
      'What hardware lab facilities and kits are provided to students?'
    ]
  },
  {
    id: 'embedded_systems',
    code: 'CV-EMB-01',
    title: 'PG Diploma in Embedded Systems Design',
    category: 'Core Engineering',
    duration: '6 Months (Full-Time) / Weekend Track',
    description: 'Flagship engineering program covering Embedded C, Data Structures, ARM Cortex-M4/A architecture, RTOS (FreeRTOS), Linux Internals, and Communication Protocols (I2C, SPI, UART, CAN).',
    highlights: [
      'Bare-metal programming on ARM Cortex-M4 (STM32F4)',
      'Real-time operating system concepts with FreeRTOS multitasking',
      'Hardware communication buses: I2C, SPI, UART, CAN',
      'Linux Shell scripting and system programming',
      'Direct placement opportunities in automotive and semiconductor firms'
    ],
    keySkills: ['Embedded C', 'ARM Cortex Architecture', 'FreeRTOS', 'Linux System Calls', 'I2C / SPI / CAN / UART', 'GDB & JTAG Debugging'],
    sampleQuestions: [
      'How does priority inversion occur in FreeRTOS and how does priority inheritance solve it?',
      'What is the difference between SPI and I2C protocol in embedded systems?',
      'Explain ARM Cortex-M4 interrupt handling and NVIC operation.',
      'How do you write an efficient circular buffer in Embedded C for UART reception?'
    ]
  },
  {
    id: 'vlsi_design',
    code: 'CV-VLSI-02',
    title: 'Advanced VLSI Design & Verification',
    category: 'Semiconductor & Chip Design',
    duration: '6 Months (Comprehensive)',
    description: 'Industrial curriculum on Digital System Design, Verilog HDL, SystemVerilog OOP, UVM (Universal Verification Methodology), FPGA Prototyping, and Static Timing Analysis (STA).',
    highlights: [
      'Full verification flow using SystemVerilog OOP and constrained random tests',
      'UVM Testbench Architecture: Driver, Monitor, Sequencer, Scoreboard',
      'FPGA Synthesis and implementation on Xilinx / Intel boards',
      'Synthesis constraints, Clock Domain Crossing (CDC), and STA',
      'Hiring by Qualcomm, Texas Instruments, Intel, AMD, Synopsys, Cadence'
    ],
    keySkills: ['Verilog HDL', 'SystemVerilog (OOP & Assertions)', 'UVM Methodology', 'FPGA Prototyping', 'Static Timing Analysis (STA)', 'ModelSim / QuestaSim'],
    sampleQuestions: [
      'Explain UVM architecture: how does Driver interact with Sequencer via TLM ports?',
      'What is Clock Domain Crossing (CDC) and how do 2-FF synchronizers prevent metastability?',
      'Write a SystemVerilog constraint to generate random non-repeating numbers.',
      'What is the difference between blocking and non-blocking assignments in Verilog?'
    ]
  },
  {
    id: 'automotive_embedded',
    code: 'CV-AUTO-03',
    title: 'Automotive Embedded Systems & AUTOSAR',
    category: 'Automotive & EV',
    duration: '5 Months (Industry Immersion)',
    description: 'Specialized track for the automotive industry covering Classic AUTOSAR layered architecture, CAN/LIN/FlexRay/Automotive Ethernet, ECU firmware, and ISO 26262 functional safety.',
    highlights: [
      'AUTOSAR Layered Architecture: MCAL, BSW, RTE, and Application SWCs',
      'Automotive in-vehicle networking: CAN-FD, LIN, and Diagnostics over IP (DoIP)',
      'UDS Protocol (ISO 14229) implementation and OBD-II diagnostics',
      'Functional Safety principles according to ISO 26262 (ASIL A-D)',
      'Hiring by Bosch, Continental, Valeo, Tata Motors, KPIT, ZF'
    ],
    keySkills: ['Classic AUTOSAR', 'CAN / CAN-FD Protocol', 'LIN & FlexRay', 'UDS (ISO 14229)', 'ISO 26262 ASIL', 'Vector CANoe & CAPL'],
    sampleQuestions: [
      'What is the role of the Runtime Environment (RTE) in AUTOSAR architecture?',
      'Explain CAN bus arbitration mechanism and bit-stuffing rules.',
      'How does Unified Diagnostic Services (UDS) handle ECU flashing via service 0x34, 0x36, 0x37?',
      'What are the ASIL safety levels in ISO 26262 and how is hazard risk assessed?'
    ]
  },
  {
    id: 'iot_edge_ai',
    code: 'CV-IOT-04',
    title: 'IoT & Edge AI Systems',
    category: 'Connected Systems',
    duration: '4 Months (Project Intensive)',
    description: 'Hands-on training in connected smart devices using ESP32, Raspberry Pi, MQTT/CoAP protocols, BLE, AWS IoT Core, and running TinyML / Edge Neural Networks on low-power silicon.',
    highlights: [
      'Microcontroller cloud connectivity with ESP-IDF and FreeRTOS',
      'Low-power wireless: BLE 5.0, Zigbee, LoRaWAN, Wi-Fi',
      'Cloud telemetry using MQTT, TLS encryption, and AWS IoT Greengrass',
      'TinyML: Deploying quantized TensorFlow Lite models on ARM Cortex-M microcontrollers',
      'Real-world capstone projects in smart agriculture, industrial predictive maintenance'
    ],
    keySkills: ['ESP32 (ESP-IDF)', 'MQTT / CoAP / HTTP REST', 'BLE 5.0 & Mesh', 'AWS IoT Core / Azure IoT', 'TinyML (TensorFlow Lite for Microcontrollers)', 'Edge AI Quantization'],
    sampleQuestions: [
      'How do you optimize an ESP32 for deep sleep mode consuming less than 15uA?',
      'What is QoS (Quality of Service) 0, 1, and 2 in MQTT protocol and how do acknowledgments work?',
      'How can a Convolutional Neural Network be quantized to INT8 for deployment on an ARM Cortex-M microcontroller?',
      'Explain BLE advertising packets and GATT service/characteristic structure.'
    ]
  },
  {
    id: 'linux_internals',
    code: 'CV-LNX-05',
    title: 'Linux Kernel Internals & Device Drivers',
    category: 'Systems Software',
    duration: '4 Months (Systems Track)',
    description: 'Deep dive into Linux operating system architecture, kernel space vs user space, loadable kernel modules (LKM), character drivers, interrupt handling (top/bottom halves), and platform device drivers.',
    highlights: [
      'Writing custom Linux Character Device Drivers and sysfs/procfs interfaces',
      'Interrupt management: Tasklets, Workqueues, Threaded IRQs',
      'Device Tree (DTS) bindings and Platform Driver model',
      'Kernel synchronization: Spinlocks, Mutexes, Semaphores, RCU',
      'Memory management: kmalloc, vmalloc, DMA buffers, MMU paging'
    ],
    keySkills: ['Linux Kernel Modules', 'Char & Platform Drivers', 'Device Tree (DTS)', 'Interrupt Handlers & Workqueues', 'Kernel Synchronization (Spinlocks)', 'GDB Kernel Debugging (KGDB)'],
    sampleQuestions: [
      'What is the difference between spinlocks and mutexes in Linux kernel space, and why can spinlocks be used in interrupt context?',
      'How does the Linux Device Tree mechanism map physical hardware peripherals to platform drivers?',
      'Explain the difference between Top Half and Bottom Half (Workqueue vs Tasklet) in Linux interrupt processing.',
      'How does copy_to_user and copy_from_user protect kernel memory space during ioctl operations?'
    ]
  }
];
