export interface KnowledgeDocument {
  id: string;
  title: string;
  courseId: string;
  fileName: string;
  fileSize: string;
  status: 'indexed' | 'processing' | 'ready' | 'failed';
  pages: number;
  uploadDate: string;
  description: string;
  rawText: string;
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docName: string;
  courseId: string;
  courseName: string;
  page: number;
  chunkIndex: number;
  content: string;
}

export const INITIAL_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 'doc-cv-prospectus',
    title: 'Cranes Varsity Institute Prospectus & Placement Record (2025-26)',
    courseId: 'general',
    fileName: 'Cranes_Varsity_Prospectus_2025_26.pdf',
    fileSize: '3.4 MB',
    status: 'indexed',
    pages: 28,
    uploadDate: '2025-01-15',
    description: 'Official institute overview, 28+ years heritage, admissions criteria, placement statistics, 2000+ recruitment partners, Bangalore campuses in Rajajinagar and Jayanagar.',
    rawText: `
Cranes Varsity - Pioneers in Technical Education & Embedded Training Since 1996.
Bangalore Headquarters: #2, 1st Floor, 5th Main Road, Rajajinagar, Bengaluru, Karnataka 560010.
Branch: 4th Block, Jayanagar, Bengaluru.
Contact Admissions: +91 80 4128 1111 / info@cranesvarsity.com.

OVERVIEW & LEGACY:
Cranes Varsity is the educational division of Cranes Software International Ltd. Over the past 28 years, Cranes has trained over 50,000+ engineering graduates and working professionals in cutting-edge embedded hardware, VLSI semiconductor design, automotive technologies, and data science. Cranes Varsity operates with the mission to bridge the critical gap between university academic theory and industry engineering standards.

PLACEMENTS & RECRUITING PARTNERS:
Cranes Varsity guarantees 100% placement support for all eligible students enrolled in our flagship PG Diploma programs. We have established tie-ups with over 2,000+ multinational corporate partners.
Top Tier Hiring Partners:
1. Semiconductor: Qualcomm, Intel, Texas Instruments, AMD, NXP Semiconductors, Infineon, STMicroelectronics, Broadcom, Synopsys, Cadence.
2. Automotive Tier-1: Robert Bosch, Continental Automotive, Valeo, Tata Motors, Mahindra Electric, KPIT, ZF Group, Aptiv.
3. Embedded & Systems: Honeywell, Rockwell Automation, Larsen & Toubro (L&T TS), Wipro Embedded, HCL Tech, Mindtree.
Average Placement Package: ₹4.8 LPA to ₹8.5 LPA for fresh graduates; ₹10 LPA to ₹18 LPA for candidates with prior experience. Highest CTC recorded: ₹16.4 LPA in automotive semiconductor design.
Placement Process includes technical grooming, weekly mock interviews, resume optimization, dedicated campus drives, and direct technical interview schedules.

ADMISSION & ELIGIBILITY CRITERIA:
- Target Candidates: B.E. / B.Tech / M.E. / M.Tech in ECE, EEE, CSE, IT, Instrumentation, Telecommunication, Mechatronics; MCA / M.Sc Electronics.
- Minimum Aggregate: 60% or 6.0 CGPA across graduation (relaxation of 5% for students clearing Cranes Technical Aptitude Test).
- Admission Process: 1. Registration via cranesvarsity.com; 2. Technical Screening Evaluation (Basic C Programming and Digital Electronics); 3. Personal Counseling; 4. Seat Allocation and Enrollment.
- Batches: New batches commence on the 1st and 3rd Monday of every month. Morning (9:00 AM - 1:00 PM), Afternoon (2:00 PM - 6:00 PM), and Weekend Executive Tracks for working engineers.

LAB FACILITIES & INFRASTRUCTURE:
Cranes Varsity houses dedicated industrial laboratories equipped with STM32F4 Discovery boards (ARM Cortex-M4), Xilinx Artix-7 and Spartan-6 FPGA development kits, CANoe bus analyzer hardware, digital storage oscilloscopes (DSO), logic analyzers, and industry standard EDA software licenses (ModelSim, Questa, Vivado, Keil MDK-ARM).
`
  },
  {
    id: 'doc-emb-guide',
    title: 'Embedded Systems Design PG Diploma Curriculum & Technical Manual',
    courseId: 'embedded_systems',
    fileName: 'Embedded_Systems_Curriculum_Manual.pdf',
    fileSize: '4.8 MB',
    status: 'indexed',
    pages: 42,
    uploadDate: '2025-01-20',
    description: 'Detailed syllabus, ARM Cortex-M4 internals, FreeRTOS scheduling algorithms, bare-metal peripheral drivers (UART, SPI, I2C), and DMA memory management.',
    rawText: `
MODULE 1: ADVANCED EMBEDDED C PROGRAMMING & DATA STRUCTURES:
- Memory segmentation in C: Text, Data (initialized), BSS (uninitialized), Heap, and Stack.
- Deep dive into Pointers: Pointer arithmetic, function pointers for callback architectures, void pointers, pointers to structures, and array of function pointers for state machine implementation.
- Keywords and qualifiers: 'volatile' qualifier prevents compiler register optimization and forces read/write directly to hardware memory-mapped registers; 'const' pointer vs pointer to const; 'static' scope limiter.
- Bitwise manipulation: Setting bits (REG |= (1 << n)), clearing bits (REG &= ~(1 << n)), toggling bits (REG ^= (1 << n)), checking bit status. Masking and packing data.
- Embedded Data Structures: Circular Ring Buffers (FIFO) with thread-safe atomic head/tail pointers, Singly & Doubly Linked Lists for dynamic task queues, binary state trees.

MODULE 2: ARM CORTEX-M4 ARCHITECTURE & BARE-METAL PROGRAMMING:
- Architecture: 32-bit RISC ARMv7-M architecture, 3-stage pipeline (Fetch, Decode, Execute), Harvard bus architecture with separate I-Code, D-Code, and System buses.
- Registers: R0-R12 general purpose, R13 (SP - Main Stack Pointer MSP and Process Stack Pointer PSP), R14 (LR Link Register), R15 (PC Program Counter), xPSR (Program Status Register).
- Operating Modes: Thread Mode (normal application execution) and Handler Mode (exception/interrupt handling). Privilege levels: Privileged vs Unprivileged.
- Nested Vectored Interrupt Controller (NVIC): Supports up to 240 external interrupts with programmable priority grouping (preemption priority and sub-priority). Low-latency interrupt handling with hardware register stacking (R0-R3, R12, LR, PC, xPSR pushed to stack automatically in 12 clock cycles).
- Memory-Mapped I/O (MMIO): Peripheral base addresses, RCC (Reset & Clock Control) register configuration to enable APB1/APB2 peripheral bus clocks.

MODULE 3: COMMUNICATION PROTOCOLS (UART, I2C, SPI, CAN):
- UART: Asynchronous serial protocol, start bit (logic 0), 8 data bits, optional parity, 1 or 2 stop bits (logic 1). Baud rate calculation with BRR register. Baud rate formula: USARTDIV = fCK / (16 * BaudRate).
- SPI (Serial Peripheral Interface): Synchronous, full-duplex, master-slave protocol. Signals: MOSI, MISO, SCK, CS/SS. Clock polarity (CPOL) and Clock phase (CPHA) yielding 4 transmission modes. Speeds up to 25 MHz+.
- I2C (Inter-Integrated Circuit): Synchronous, half-duplex, 2-wire serial bus (SDA, SCL) with open-drain outputs requiring external pull-up resistors (typically 4.7kΩ). 7-bit addressing, master-slave arbitration with ACK/NACK signaling, clock stretching by slave. Standard mode (100 kbps), Fast mode (400 kbps).

MODULE 4: REAL-TIME OPERATING SYSTEMS (RTOS) WITH FREERTOS:
- RTOS Fundamentals: Deterministic latency, preemptive priority-based scheduling, cooperative scheduling, Round-Robin time slicing with SysTick timer tick (typically 1ms).
- Tasks & States: Running, Ready, Blocked, Suspended. Task Control Block (TCB) contains task stack pointer, task priority, and state list item.
- Inter-Task Communication & Synchronization: FreeRTOS Queues for message passing, Binary Semaphores for task synchronization, Counting Semaphores for resource pools, Mutexes for exclusive access.
- Priority Inversion Problem: Occurs when a high-priority task is blocked waiting for a mutex held by a low-priority task, and a medium-priority task preempts the low-priority task, causing unbounded delay for the high-priority task.
- Solution: Priority Inheritance Protocol, where the low-priority task temporarily inherits the priority of the highest priority blocked task until releasing the mutex.
`
  },
  {
    id: 'doc-vlsi-guide',
    title: 'Advanced VLSI Verification & SystemVerilog UVM Handbook',
    courseId: 'vlsi_design',
    fileName: 'VLSI_Verification_UVM_Handbook.pdf',
    fileSize: '5.2 MB',
    status: 'indexed',
    pages: 36,
    uploadDate: '2025-01-22',
    description: 'SystemVerilog OOP, UVM testbench architecture, constrained random verification, functional coverage, SystemVerilog Assertions (SVA), and Static Timing Analysis.',
    rawText: `
MODULE 1: VERILOG HDL & DIGITAL DESIGN RECAP:
- RTL synthesis rules: Combinational logic using 'always @(*)' with blocking assignments (=); Sequential logic using 'always @(posedge clk or negedge rst_n)' with non-blocking assignments (<=).
- Avoiding latches: Complete assignments in all branches of if-else and case statements; use 'default' branch.
- Finite State Machines (FSM): Moore machine (outputs depend only on current state) vs Mealy machine (outputs depend on current state and current inputs). Best practice is 3-process FSM (State Register, Next State Logic, Output Logic).

MODULE 2: SYSTEMVERILOG FOR ADVANCED VERIFICATION:
- Object-Oriented Programming (OOP) in SV: Classes, objects, 'this' keyword, 'super' handle, inheritance, virtual methods for dynamic polymorphism.
- Data types: logic, bit (2-state), byte, int, queues ($), dynamic arrays, associative arrays.
- Constrained Random Verification: 'rand' and 'randc' (random cyclic) keywords. Writing constraints with 'inside', 'solve...before', conditional 'if-else' constraints, and soft constraints.
- Functional Coverage: 'covergroup', 'coverpoint', bins, cross coverage to measure verification completeness against the design specification.
- SystemVerilog Assertions (SVA): Immediate assertions vs Concurrent assertions using clock ticks. Sequence declaration, properties, implication operators: |-> (overlapping) and |=> (non-overlapping).

MODULE 3: UNIVERSAL VERIFICATION METHODOLOGY (UVM 1.2):
- UVM Class Hierarchy: Inherits from uvm_void -> uvm_object -> uvm_report_object -> uvm_component.
- UVM Components:
  1. Sequence Item (Transaction): Defines data packet format (e.g. address, data, read/write op).
  2. Sequence: Generates streams of transactions to exercise DUT.
  3. Sequencer: Arbitrates and passes transactions from sequence to driver.
  4. Driver: Translates transactions (abstract data) into pin-level signals connected to DUT interface.
  5. Monitor: Samples pin-level activity on DUT interface, converts to transactions, and broadcasts via TLM analysis port.
  6. Scoreboard: Receives transactions from monitor and reference model, checks data integrity and flags errors.
  7. Agent: Encapsulates Sequencer, Driver, and Monitor. Can be configured as ACTIVE (includes driver) or PASSIVE (monitor only).
  8. Environment (Env): Assembles agents, scoreboard, and coverage collectors.
  9. Test: Instantiates environment, selects sequences, runs test cases.
- UVM Phases: Build Phase (top-down), Connect Phase (bottom-up), End of Elaboration, Start of Simulation, Run Phase (time-consuming task), Extract, Check, Report, Final Phase.
- TLM (Transaction Level Modeling) FIFO & Ports: 'uvm_analysis_port' and 'uvm_analysis_imp' for broadcast without backpressure.
`
  },
  {
    id: 'doc-auto-guide',
    title: 'Automotive Embedded Systems, AUTOSAR Architecture & ISO 26262 Specification',
    courseId: 'automotive_embedded',
    fileName: 'Automotive_AUTOSAR_ISO26262_Spec.pdf',
    fileSize: '4.1 MB',
    status: 'indexed',
    pages: 32,
    uploadDate: '2025-01-25',
    description: 'Classic AUTOSAR layered architecture, MCAL, BSW, RTE, SWCs, CAN-FD, LIN, FlexRay, UDS ISO 14229 diagnostics, and ISO 26262 ASIL functional safety standard.',
    rawText: `
AUTOSAR (AUTOMOTIVE OPEN SYSTEM ARCHITECTURE) CLASSIC PLATFORM:
- Architecture Overview: AUTOSAR separates automotive application software from the underlying microcontroller hardware through a standardized 3-layer stack:
  1. Application Layer: Composed of Software Components (SWCs). Each SWC contains Runnable entities, Ports (Sender-Receiver or Client-Server), and Internal Behavior. SWCs are independent of the target ECU hardware.
  2. Runtime Environment (RTE): Acts as the communication middleware (Virtual Functional Bus - VFB). It abstracts intra-ECU communication (between SWCs on same ECU) and inter-ECU communication (over CAN/LIN buses) identically through RTE API calls (e.g., Rte_Read, Rte_Write).
  3. Basic Software (BSW): Provides underlying system services. Structured into 4 sub-layers:
     - Services Layer: OS (OSEK/VDX based priority scheduler), Diagnostic Event Manager (DEM), Diagnostic Communication Manager (DCM), NVRAM Manager (NvM), EcuM (ECU State Manager).
     - ECU Abstraction Layer: Abstraction of external devices (CAN Transceiver, SPI EEPROM).
     - Microcontroller Abstraction Layer (MCAL): Hardware-specific drivers that directly access microcontroller registers (Port, Dio, Adc, Pwm, Can, Spi).
     - Complex Device Drivers (CDD): Direct hardware access bypassing AUTOSAR stack for ultra-fast response (e.g. engine injection control).

IN-VEHICLE NETWORKING PROTOCOLS:
- CAN (Controller Area Network) & CAN-FD:
  - Multi-master broadcast bus with Non-Destructive Bitwise Arbitration using message identifier (11-bit standard or 29-bit extended). Dominant bit (logic 0) overrides Recessive bit (logic 1). The lowest ID has the highest bus priority.
  - CAN-FD (Flexible Data-rate): Increases payload from 8 bytes up to 64 bytes and increases data phase bit-rate up to 5 Mbps (arbitration phase remains 500 kbps to 1 Mbps).
  - Error detection: CRC (Cyclic Redundancy Check), Frame Check, Bit Stuffing (5 consecutive identical bits requires stuffing an opposite bit).
- LIN (Local Interconnect Network): Single-wire, low-cost master-single-slave sub-bus (19.2 kbps) for body electronics (seat adjustments, wipers, mirror control).

UDS DIAGNOSTICS (ISO 14229) & ON-BOARD DIAGNOSTICS:
- UDS Client-Server protocol used for vehicle manufacturing and service diagnostics.
- Core Diagnostic Services:
  - 0x10: Diagnostic Session Control (Default, Programming, Extended).
  - 0x22: Read Data By Identifier (DID).
  - 0x2E: Write Data By Identifier (DID).
  - 0x19: Read DTC (Diagnostic Trouble Code) Information.
  - 0x27: Security Access (Seed & Key algorithm).
  - 0x31: Routine Control (start/stop self-tests).
  - 0x34, 0x36, 0x37: Request Download, Transfer Data, Request Transfer Exit (for flashing firmware over CAN/Ethernet).

ISO 26262 FUNCTIONAL SAFETY:
- Standard for electrical/electronic systems safety in road vehicles.
- HARA (Hazard Analysis and Risk Assessment): Identifies potential hazards and assigns ASIL (Automotive Safety Integrity Level) from QM (Quality Management), ASIL A, ASIL B, ASIL C, to ASIL D (most stringent safety level, e.g., electric steering, brake-by-wire).
- ASIL determination based on 3 factors: Severity (S0-S3), Exposure probability (E0-E4), and Controllability by driver (C0-C3).
`
  },
  {
    id: 'doc-iot-guide',
    title: 'Internet of Things (IoT), TinyML & Edge AI Systems Guide',
    courseId: 'iot_edge_ai',
    fileName: 'IoT_TinyML_EdgeAI_Guide.pdf',
    fileSize: '3.9 MB',
    status: 'indexed',
    pages: 26,
    uploadDate: '2025-01-28',
    description: 'ESP32 architecture, FreeRTOS dual-core tasks, MQTT broker connectivity, AWS IoT Greengrass, and quantized TensorFlow Lite for Microcontrollers (TinyML).',
    rawText: `
MODULE 1: CONNECTED HARDWARE ARCHITECTURE (ESP32):
- ESP32 SoC: Dual-core Tensilica Xtensa LX6 microprocessor running at 240 MHz, 520 KB SRAM, integrated 802.11 b/g/n Wi-Fi and Bluetooth 4.2 / BLE.
- Power Management & Sleep Modes: Active mode (80-240 mA), Modem-sleep, Light-sleep (0.8 mA), Deep-sleep (10 uA), and Hibernation (5 uA). Ultra-Low-Power (ULP) co-processor monitors sensors while main cores sleep.
- Pinout & Peripherals: 36 GPIOs, 12-bit ADC (18 channels), 2x 8-bit DAC, capacitive touch sensors, hardware cryptographic acceleration (AES, SHA, RSA, ECC).

MODULE 2: IOT MESSAGING & CLOUD PROTOCOLS:
- MQTT (Message Queuing Telemetry Transport): Extremely lightweight publish/subscribe protocol running over TCP/IP (port 1883 or TLS 8883).
- MQTT Quality of Service (QoS):
  - QoS 0 (At most once): Fire and forget, no delivery guarantee.
  - QoS 1 (At least once): Message delivered with PUBACK; message may duplicate.
  - QoS 2 (Exactly once): Four-step handshake (PUBLISH -> PUBREC -> PUBREL -> PUBCOMP) ensuring exactly one delivery.
- Cloud Integration: AWS IoT Core with X.509 client certificate authentication, Device Shadow (JSON state document synchronizing reported vs desired state).

MODULE 3: TINYML & EDGE ARTIFICIAL INTELLIGENCE:
- Running neural networks on microcontrollers with constrained RAM (<256 KB) and Flash (<1 MB).
- Workflow: 1. Model training in Python / TensorFlow / PyTorch; 2. Post-training quantization from FP32 (floating point) to INT8 (8-bit integer) using TensorFlow Lite Converter, reducing model size by 75% and accelerating inference by 4x with negligible accuracy drop; 3. Export to C byte array (model.cc); 4. Inference on microcontroller using TensorFlow Lite for Microcontrollers (TFLM).
- Applications: Keyword spotting (voice command wakeup), vibration anomaly detection on industrial motors, gesture classification using 6-axis IMU (accelerometer + gyroscope).
`
  },
  {
    id: 'doc-lnx-guide',
    title: 'Linux Kernel Internals, Platform Device Drivers & Interrupt Handling',
    courseId: 'linux_internals',
    fileName: 'Linux_Kernel_Device_Drivers.pdf',
    fileSize: '4.5 MB',
    status: 'indexed',
    pages: 34,
    uploadDate: '2025-02-02',
    description: 'Kernel space vs user space, Loadable Kernel Modules (LKM), character drivers, file_operations, top/bottom half interrupt handlers, and device tree (DTS).',
    rawText: `
MODULE 1: LINUX KERNEL ARCHITECTURE & LOADABLE KERNEL MODULES (LKM):
- User Space vs Kernel Space: User space operates in unprivileged processor ring (Ring 3 on x86, EL0 on ARM), protected by virtual memory and MMU; Kernel space runs in Ring 0 / EL1 with full hardware access. Transition via system calls (SVC/SWI instruction).
- Kernel Module Skeleton: 'module_init(my_init)' called during insmod; 'module_exit(my_exit)' called during rmmod. MODULE_LICENSE("GPL"), MODULE_AUTHOR, MODULE_DESCRIPTION.
- Compilation: Kernel modules compile against kernel source tree using Makefile with 'obj-m += my_driver.o' and 'make -C /lib/modules/$(uname -r)/build M=$(PWD) modules'.

MODULE 2: CHARACTER DEVICE DRIVER IMPLEMENTATION:
- Device numbers: Major number identifies the driver associated with the device; Minor number is used by the driver to differentiate individual hardware instances. Dynamic allocation with 'alloc_chrdev_region(&dev_num, 0, 1, "my_cdev")'.
- Registering cdev: 'cdev_init(&my_cdev, &fops)' and 'cdev_add(&my_cdev, dev_num, 1)'. Creating device node in /dev with 'class_create' and 'device_create'.
- 'struct file_operations fops': Maps user space system calls (open, release, read, write, unlocked_ioctl) to kernel driver functions.
- Memory protection: Never dereference user space pointers directly in kernel space! Use 'copy_to_user(user_dest, kernel_src, count)' and 'copy_from_user(kernel_dest, user_src, count)' to safely cross virtual address boundaries.

MODULE 3: INTERRUPT HANDLING IN LINUX:
- Registering IRQ: 'request_irq(irq_number, irq_handler, IRQF_SHARED, "my_dev", dev_id)'.
- Top Half vs Bottom Half:
  - Top Half (Hard IRQ): Executes immediately upon hardware interrupt with interrupts disabled. Must be extremely short; acknowledges hardware and schedules bottom half. Cannot sleep or call blocking functions!
  - Bottom Half: Executes deferred, time-consuming processing with interrupts enabled. Three mechanisms:
    1. Softirqs: Statically compiled, high-performance, run in interrupt context concurrently on multiple CPUs (e.g. network stack, block devices).
    2. Tasklets: Built on top of softirqs, serialized so the same tasklet never runs on multiple CPUs simultaneously. Cannot sleep.
    3. Workqueues: Run in process context (kworker kernel thread). CAN sleep, allocate memory with GFP_KERNEL, take mutexes, and perform I/O.
- Device Tree (DTS): Open Firmware device tree describing non-discoverable hardware components on SoC (base address, registers, interrupts, clocks, GPIO pins). Driver binds to device node via 'of_device_id' matching string.
`
  }
];

export function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const clean = text.replace(/\r\n/g, '\n').trim();
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < clean.length) {
    let endIndex = startIndex + chunkSize;
    if (endIndex >= clean.length) {
      chunks.push(clean.substring(startIndex).trim());
      break;
    }
    
    // Attempt to break at paragraph or newline or period
    const nextNewline = clean.lastIndexOf('\n\n', endIndex);
    if (nextNewline > startIndex + 300) {
      endIndex = nextNewline;
    } else {
      const nextSentence = clean.lastIndexOf('. ', endIndex);
      if (nextSentence > startIndex + 300) {
        endIndex = nextSentence + 1;
      }
    }

    const chunk = clean.substring(startIndex, endIndex).trim();
    if (chunk.length > 50) {
      chunks.push(chunk);
    }

    startIndex = Math.max(startIndex + 100, endIndex - overlap);
  }

  return chunks;
}

export function buildAllChunks(docs: KnowledgeDocument[]): DocumentChunk[] {
  const allChunks: DocumentChunk[] = [];
  
  docs.forEach((doc) => {
    if (doc.status !== 'indexed') return;
    const pieces = chunkText(doc.rawText, 1000, 200);
    pieces.forEach((piece, idx) => {
      // estimate page based on chunk index and total pages
      const estPage = Math.min(doc.pages, Math.max(1, Math.floor((idx / Math.max(1, pieces.length)) * doc.pages) + 1));
      allChunks.push({
        id: `${doc.id}-chunk-${idx + 1}`,
        docId: doc.id,
        docName: doc.fileName,
        courseId: doc.courseId,
        courseName: doc.title,
        page: estPage,
        chunkIndex: idx + 1,
        content: piece
      });
    });
  });

  return allChunks;
}
