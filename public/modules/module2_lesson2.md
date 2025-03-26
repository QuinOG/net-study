### Module 1: Routing and Switching Essentials

#### Lesson 1.2: Inter-VLAN Routing

**Learning Goal:** Understand the methods, implementation, and best practices for enabling communication between different VLANs in a switched network.

**Duration:** 45-50 minutes

**Prerequisites:** Understanding of VLANs, basic IP routing concepts, and subnet addressing

##### Introduction
While VLANs effectively segment a network into isolated broadcast domains, most network environments require controlled communication between these segments. Inter-VLAN routing provides the mechanism for this communication, allowing devices in different VLANs to exchange data through a Layer 3 device while maintaining the security and performance benefits of VLAN segmentation. This lesson explores the various methods for implementing inter-VLAN routing, from traditional router-on-a-stick configurations to modern multilayer switching approaches. Understanding these concepts is essential for designing and implementing scalable, secure networks that balance isolation with necessary connectivity between network segments.

##### Key Concepts
- **Inter-VLAN Routing Fundamentals:** Purpose and principles of routing between VLANs
- **Router-on-a-Stick Method:** Traditional approach using router interfaces or subinterfaces
- **Multilayer Switching:** Modern approach using Layer 3 switches with SVIs
- **Performance Considerations:** Throughput, latency, and scalability factors
- **Security Implementation:** Access control between VLANs
- **Troubleshooting Methodology:** Common issues and resolution approaches

##### Inter-VLAN Routing Fundamentals

Inter-VLAN routing enables communication between devices in different VLANs by using Layer 3 routing processes to forward traffic between these logically separated network segments. This capability is essential in modern networks, where segmentation must balance security isolation with practical communication needs.

At its core, inter-VLAN routing addresses a fundamental limitation of VLAN technology. VLANs create separate broadcast domains that operate as distinct Layer 2 networks, preventing direct communication between devices in different VLANs. While this isolation provides security and performance benefits, it creates a practical challenge: most network environments require at least some communication between different departments, functions, or security zones. Inter-VLAN routing solves this problem by introducing Layer 3 routing between these segments, allowing controlled communication while maintaining logical separation.

The routing process between VLANs follows standard IP routing principles. When a device in one VLAN needs to communicate with a device in another VLAN, it sends the packet to its default gateway (a router or Layer 3 switch interface in the local VLAN). This gateway performs a routing table lookup based on the destination IP address and forwards the packet to the appropriate VLAN. This process requires the routing device to have connectivity to all VLANs involved and appropriate interfaces or subinterfaces configured with IP addresses in each VLAN's subnet.

Inter-VLAN routing creates a strategic control point for network traffic, enabling security policy enforcement between segments. By routing between VLANs rather than switching, organizations can implement access control lists, firewall rules, and traffic inspection at the routing boundaries. This capability transforms VLANs from simple broadcast domain separators into fundamental building blocks for network security architecture, allowing granular control over which types of traffic can flow between different network segments.

##### Router-on-a-Stick Method

The router-on-a-stick method represents the traditional approach to inter-VLAN routing, using a single physical router interface connected to a switch trunk port to route between multiple VLANs. This configuration earned its distinctive name because the network diagram resembles a router with a single "stick" (interface) connecting to the switched network.

In this implementation, the router's physical interface is divided into multiple logical subinterfaces, with each subinterface configured for a different VLAN. The router and switch establish a trunk link that carries traffic for all VLANs requiring inter-VLAN communication. Each router subinterface is configured with 802.1Q encapsulation for its assigned VLAN and an IP address in that VLAN's subnet, allowing it to serve as the default gateway for devices in that VLAN.

When a device needs to communicate with a device in another VLAN, it sends the packet to its default gateway (the router's subinterface IP address in the local VLAN). The packet travels through the switch to the router's physical interface with the appropriate VLAN tag. The router processes this packet on the corresponding subinterface, makes a routing decision based on the destination IP address, and forwards the packet back through the same physical interface but with a different VLAN tag corresponding to the destination VLAN.

The router-on-a-stick configuration offers several advantages, particularly for smaller networks or environments with limited routing requirements. It requires minimal hardware (a single router interface) and works with virtually any router that supports subinterfaces and 802.1Q tagging. The configuration is straightforward and follows standard routing principles, making it accessible for administrators with basic routing knowledge.

However, this method has significant limitations that become apparent in larger or higher-throughput environments. The most notable limitation is performance: all inter-VLAN traffic must traverse a single physical link, creating a potential bottleneck. Additionally, this approach introduces a single point of failure, as all inter-VLAN communication depends on one physical interface and one trunk link. These limitations make router-on-a-stick most appropriate for smaller networks, testing environments, or situations where inter-VLAN traffic volume is relatively low.

##### Multilayer Switching

Multilayer switching represents the modern approach to inter-VLAN routing, integrating Layer 2 switching and Layer 3 routing functions within a single device. This integration eliminates the external router requirement of traditional methods, providing significant performance and scalability advantages.

At the heart of multilayer switching is specialized hardware that performs routing functions at near-switching speeds. Unlike traditional routers that process routing decisions in software, multilayer switches use Application-Specific Integrated Circuits (ASICs) to perform routing lookups in hardware, dramatically increasing throughput and reducing latency. This hardware acceleration enables multilayer switches to route packets between VLANs at speeds approaching their switching backplane capacity, often in the hundreds of gigabits per second.

Multilayer switches typically implement inter-VLAN routing through Switch Virtual Interfaces (SVIs). An SVI is a virtual interface associated with a specific VLAN within the switch. Each SVI is configured with an IP address in its VLAN's subnet and functions as the default gateway for devices in that VLAN. When a device sends traffic to another VLAN, the packet is routed through the appropriate SVIs without leaving the switch, eliminating the external trunk link required in router-on-a-stick configurations.

This approach offers several significant advantages over traditional methods. Performance improves dramatically, as inter-VLAN routing occurs within the switch backplane rather than traversing external links. Scalability increases, as the routing capacity typically matches the switching capacity of the device. Reliability improves through the elimination of external trunk links and the ability to implement redundant switches with protocols like HSRP or VRRP. Configuration and management become simpler with a single device handling both switching and routing functions.

Multilayer switching has become the standard approach for inter-VLAN routing in most modern networks, from medium-sized business environments to large enterprise deployments. The performance, scalability, and integration benefits typically outweigh the higher initial cost of multilayer switches compared to standard Layer 2 switches with separate routers. As these devices have become more affordable and their features more accessible, they've largely replaced traditional router-on-a-stick implementations except in very small networks or specialized scenarios.

##### Performance Considerations

Performance factors significantly influence the selection and implementation of inter-VLAN routing methods, with throughput, latency, and scalability representing key considerations for network designers.

Throughput capacity varies dramatically between different inter-VLAN routing approaches. Router-on-a-stick configurations are limited by the bandwidth of a single physical interface—typically 1 Gbps or 10 Gbps in modern implementations. This creates a potential bottleneck, as all inter-VLAN traffic must share this single link. In contrast, multilayer switches can often route between VLANs at their full backplane capacity, which may reach hundreds of gigabits or even terabits per second in enterprise-grade equipment. This difference becomes particularly significant in environments with high volumes of inter-VLAN traffic, such as data centers or networks with centralized resources accessed by users in multiple VLANs.

Latency—the time required to process and forward packets—also varies between implementation methods. Traditional routers typically introduce higher latency due to their software-based packet processing. Each packet must be processed by the router's CPU, examined for routing decisions, and then forwarded. Multilayer switches significantly reduce this latency through hardware-based routing using specialized ASICs, often achieving latency measured in microseconds rather than milliseconds. This reduced latency becomes critical for time-sensitive applications like voice, video, or financial transactions that require rapid response times.

Scalability considerations extend beyond raw performance to include factors like the number of VLANs supported, routing table capacity, and the ability to adapt to growing network requirements. Router-on-a-stick implementations face practical limits in the number of subinterfaces that can be configured on a single physical interface, typically constrained by router memory and processing capacity. Each additional VLAN increases the processing burden on the router. Multilayer switches generally offer superior scalability, supporting hundreds or thousands of VLANs with minimal performance impact due to their hardware-based routing architecture.

The impact of these performance factors varies based on network size and traffic patterns. Small networks with limited inter-VLAN traffic may function adequately with router-on-a-stick implementations, particularly if the router interface speed matches or exceeds the typical traffic volume. However, as networks grow in size and complexity, the performance advantages of multilayer switching become increasingly significant. Organizations should evaluate their current requirements and anticipated growth when selecting an inter-VLAN routing approach, considering not just current traffic volumes but future expansion and evolving application needs.

##### Security Implementation

Security represents a critical dimension of inter-VLAN routing implementation, as the routing boundaries between VLANs create natural control points for enforcing network security policies.

Access control between VLANs forms the foundation of inter-VLAN security, determining which types of traffic can flow between different network segments. This control is typically implemented through Access Control Lists (ACLs) applied to router interfaces, subinterfaces, or SVIs. These ACLs filter traffic based on criteria like source and destination IP addresses, protocols, and port numbers, allowing administrators to create granular policies that permit necessary communication while blocking unauthorized access. For example, an organization might configure ACLs that allow accounting department users to access financial application servers but prevent them from accessing research and development systems. This capability transforms VLANs from simple broadcast domain separators into strategic security boundaries that compartmentalize network access based on business requirements and security policies.

Stateful inspection enhances basic access control by tracking the state of network connections and making filtering decisions based on the context of traffic rather than just individual packets. While traditional ACLs examine each packet in isolation, stateful inspection maintains information about active connections and their characteristics. This approach provides more sophisticated security capabilities, particularly for protocols that use dynamic ports or complex connection patterns. Many modern multilayer switches include basic stateful inspection capabilities, though dedicated firewall appliances or firewall services modules within switches offer more advanced features. In security-sensitive environments, organizations often implement dedicated firewalls between critical VLANs, using the routing infrastructure to direct traffic through these inspection points.

Private VLANs extend standard VLAN security by creating additional isolation within a single VLAN. This feature addresses scenarios where devices need to share the same IP subnet but require isolation from each other at Layer 2. Private VLANs create a hierarchical structure with primary and secondary VLANs, controlling which devices can communicate directly with each other even within the same logical network segment. This capability proves particularly valuable in multi-tenant environments, hosting services, or situations where devices in the same VLAN need different levels of isolation or access permissions.

Security monitoring at VLAN boundaries provides visibility into traffic patterns and potential threats moving between network segments. Many organizations implement traffic analysis, intrusion detection, or security information and event management (SIEM) systems that monitor inter-VLAN traffic for suspicious activities or policy violations. This monitoring can detect potential security incidents like unauthorized access attempts, unusual traffic patterns, or data exfiltration between segments. The routing points between VLANs create natural monitoring locations where security tools can observe traffic flows between different parts of the network.

Defense in depth strategies combine multiple security controls at VLAN boundaries to create comprehensive protection. Rather than relying solely on routing infrastructure security, organizations typically implement layered defenses that might include ACLs at the routing layer, firewall inspection for critical traffic, intrusion prevention systems for threat detection, and application-level gateways for specific protocols. This layered approach ensures that a failure or bypass of any single security control doesn't compromise the entire security architecture. The inter-VLAN routing infrastructure provides the foundation for this defense in depth strategy by creating controlled pathways between network segments where security controls can be applied.

##### Troubleshooting Methodology

Effective troubleshooting of inter-VLAN routing issues requires a systematic approach that addresses the unique challenges of this technology, where problems can span multiple network layers and components.

A structured troubleshooting methodology begins with clearly identifying the specific symptoms of the problem. Is the issue affecting all inter-VLAN communication or only specific VLANs? Are all devices in the affected VLANs experiencing the problem or only certain ones? Is the issue intermittent or constant? Answering these questions helps narrow the scope of the investigation and guides the selection of appropriate troubleshooting tools and techniques. Once the symptoms are clearly defined, the troubleshooting process typically follows the OSI model from bottom to top, checking physical connectivity first, then data link issues like VLAN configuration, and finally network layer problems like IP addressing and routing.

Common physical and data link layer issues often involve trunk configuration problems. These might include mismatched trunk encapsulation types, inconsistent native VLAN settings, or trunk links that don't permit all necessary VLANs. Verification commands like "show interfaces trunk" can identify these issues by displaying the current trunk configuration and status. VLAN assignment problems represent another common source of issues, where devices might be assigned to incorrect VLANs or VLAN configurations might not match between switches. Commands like "show vlan" help verify that VLAN assignments are correct and consistent across the network infrastructure.

Network layer troubleshooting focuses on IP addressing, routing configuration, and routing protocols. Common issues include incorrect subnet masks, missing or incorrect IP addresses on router interfaces or SVIs, or routing table problems that prevent proper forwarding between VLANs. Commands like "show ip interface brief" and "show ip route" help verify that interfaces have the correct IP addresses and that appropriate routes exist for all VLAN subnets. In environments using dynamic routing protocols, additional verification of protocol configuration and operation may be necessary to ensure routes are properly advertised and learned.

Security configuration issues frequently cause inter-VLAN routing problems that can be difficult to diagnose. ACLs or firewall rules might inadvertently block legitimate traffic between VLANs, creating connectivity problems that appear as routing failures. Commands like "show access-lists" and "show ip interface" help verify the ACLs configured on interfaces and their impact on traffic. Testing with tools like ping and traceroute with specific source addresses can help identify whether security policies are blocking traffic. In complex environments, packet captures at strategic points in the network path can provide definitive evidence of where traffic is being permitted or blocked.

Systematic testing and verification form the foundation of effective troubleshooting. This approach includes testing connectivity at each layer of the network stack, verifying configuration on all devices involved in the traffic path, and using appropriate tools to observe traffic flow. Starting with basic connectivity tests like ping between devices in the same VLAN establishes whether fundamental network functions are working correctly. Gradually expanding testing to include inter-VLAN communication helps isolate where problems occur in the traffic path. Tools like traceroute can identify exactly where packets stop flowing, while packet captures provide detailed information about traffic content and handling at specific points in the network. This systematic approach prevents overlooking potential issues and provides concrete evidence to guide problem resolution.

##### Examples

**Example 1: Router-on-a-Stick Implementation**

Consider a small business network with three VLANs:
- VLAN 10: Administration (192.168.10.0/24)
- VLAN 20: Sales (192.168.20.0/24)
- VLAN 30: Engineering (192.168.30.0/24)

The network includes one Layer 2 switch and one router with a single Gigabit Ethernet interface. The goal is to implement inter-VLAN routing using the router-on-a-stick method.

**Implementation Steps:**

1. **Configure the switch trunk port:**
   ```
   Switch# configure terminal
   Switch(config)# interface gigabitethernet 1/0/24
   Switch(config-if)# switchport mode trunk
   Switch(config-if)# switchport trunk allowed vlan 10,20,30
   Switch(config-if)# exit
   ```

2. **Configure the router with subinterfaces:**
   ```
   Router# configure terminal
   
   ! Configure the physical interface
   Router(config)# interface gigabitethernet 0/0
   Router(config-if)# no shutdown
   Router(config-if)# exit
   
   ! Configure subinterface for VLAN 10
   Router(config)# interface gigabitethernet 0/0.10
   Router(config-subif)# encapsulation dot1q 10
   Router(config-subif)# ip address 192.168.10.1 255.255.255.0
   Router(config-subif)# exit
   
   ! Configure subinterface for VLAN 20
   Router(config)# interface gigabitethernet 0/0.20
   Router(config-subif)# encapsulation dot1q 20
   Router(config-subif)# ip address 192.168.20.1 255.255.255.0
   Router(config-subif)# exit
   
   ! Configure subinterface for VLAN 30
   Router(config)# interface gigabitethernet 0/0.30
   Router(config-subif)# encapsulation dot1q 30
   Router(config-subif)# ip address 192.168.30.1 255.255.255.0
   Router(config-subif)# exit
   ```

3. **Configure client devices:**
   - Devices in VLAN 10 use 192.168.10.1 as their default gateway
   - Devices in VLAN 20 use 192.168.20.1 as their default gateway
   - Devices in VLAN 30 use 192.168.30.1 as their default gateway

4. **Implement basic security with ACLs:**
   ```
   ! Create ACL to restrict VLAN 10 (Administration) access to VLAN 30 (Engineering)
   Router(config)# access-list 101 permit ip 192.168.10.0 0.0.0.255 192.168.20.0 0.0.0.255
   Router(config)# access-list 101 deny ip 192.168.10.0 0.0.0.255 192.168.30.0 0.0.0.255
   Router(config)# access-list 101 permit ip 192.168.10.0 0.0.0.255 any
   
   ! Apply ACL to VLAN 10 subinterface
   Router(config)# interface gigabitethernet 0/0.10
   Router(config-subif)# ip access-group 101 out
   Router(config-subif)# exit
   ```

5. **Verify the configuration:**
   ```
   Router# show ip interface brief
   Router# show ip route
   Router# show interfaces trunk
   
   ! Test connectivity between VLANs
   PC-VLAN10> ping 192.168.20.100
   PC-VLAN10> ping 192.168.30.100  (should fail due to ACL)
   ```

This implementation allows devices in different VLANs to communicate through the router while enforcing security policies that restrict certain types of inter-VLAN traffic. The router-on-a-stick approach provides a cost-effective solution for this small network, though it would face scalability challenges if the network grew significantly or if inter-VLAN traffic volume increased substantially.

**Example 2: Multilayer Switch Implementation**

Consider a medium-sized business network with five VLANs:
- VLAN 10: Administration (192.168.10.0/24)
- VLAN 20: Sales (192.168.20.0/24)
- VLAN 30: Engineering (192.168.30.0/24)
- VLAN 40: Finance (192.168.40.0/24)
- VLAN 50: Guest (192.168.50.0/24)

The network includes multiple access switches connected to a multilayer switch. The goal is to implement inter-VLAN routing using the multilayer switch's routing capabilities.

**Implementation Steps:**

1. **Enable IP routing on the multilayer switch:**
   ```
   Switch# configure terminal
   Switch(config)# ip routing
   Switch(config)# exit
   ```

2. **Configure VLANs on the multilayer switch:**
   ```
   Switch(config)# vlan 10
   Switch(config-vlan)# name Administration
   Switch(config-vlan)# exit
   
   Switch(config)# vlan 20
   Switch(config-vlan)# name Sales
   Switch(config-vlan)# exit
   
   ! Continue for VLANs 30, 40, and 50
   ```

3. **Configure Switch Virtual Interfaces (SVIs) for each VLAN:**
   ```
   Switch(config)# interface vlan 10
   Switch(config-if)# ip address 192.168.10.1 255.255.255.0
   Switch(config-if)# no shutdown
   Switch(config-if)# exit
   
   Switch(config)# interface vlan 20
   Switch(config-if)# ip address 192.168.20.1 255.255.255.0
   Switch(config-if)# no shutdown
   Switch(config-if)# exit
   
   ! Continue for VLANs 30, 40, and 50
   ```

4. **Configure trunk links to access switches:**
   ```
   Switch(config)# interface gigabitethernet 1/0/1
   Switch(config-if)# switchport mode trunk
   Switch(config-if)# switchport trunk allowed vlan 10,20,30,40,50
   Switch(config-if)# exit
   
   ! Continue for other trunk interfaces
   ```

5. **Implement security with ACLs:**
   ```
   ! Create ACL to isolate Guest VLAN from internal networks
   Switch(config)# ip access-list extended GUEST-ISOLATION
   Switch(config-ext-nacl)# permit ip 192.168.50.0 0.0.0.255 any
   Switch(config-ext-nacl)# deny ip any 192.168.10.0 0.0.0.255
   Switch(config-ext-nacl)# deny ip any 192.168.20.0 0.0.0.255
   Switch(config-ext-nacl)# deny ip any 192.168.30.0 0.0.0.255
   Switch(config-ext-nacl)# deny ip any 192.168.40.0 0.0.0.255
   Switch(config-ext-nacl)# permit ip any any
   Switch(config-ext-nacl)# exit
   
   ! Apply ACL to Guest VLAN interface
   Switch(config)# interface vlan 50
   Switch(config-if)# ip access-group GUEST-ISOLATION in
   Switch(config-if)# exit
   ```

6. **Configure client devices:**
   - Devices in each VLAN use the corresponding SVI IP address as their default gateway

7. **Verify the configuration:**
   ```
   Switch# show ip interface brief
   Switch# show ip route
   Switch# show vlan
   Switch# show interfaces trunk
   
   ! Test connectivity between VLANs
   PC-VLAN10> ping 192.168.20.100  (should succeed)
   PC-VLAN50> ping 192.168.10.100  (should fail due to ACL)
   ```

This implementation provides several advantages over the router-on-a-stick approach:
- Higher performance through hardware-based routing
- No external router required
- No single physical interface bottleneck
- Simplified management with a single device handling both switching and routing
- Scalability to support additional VLANs without performance degradation

The multilayer switch approach is particularly well-suited for this medium-sized business network, providing the performance and scalability needed for current operations while accommodating future growth.

##### Hands-on Component

**Activity: Implementing and Comparing Inter-VLAN Routing Methods**

**Objective:** Configure both router-on-a-stick and multilayer switch inter-VLAN routing implementations, compare their performance and management characteristics, and implement basic security policies.

**Tools Needed:**
- One router with 802.1Q support
- One multilayer switch (or Layer 3 switch)
- One or more Layer 2 switches
- Several PCs or virtual machines
- Network cables for interconnection
- Console cables or terminal access

**Steps:**

1. **Initial Setup and Planning**
   - Create a network diagram showing the physical connections and VLAN assignments
   - Define the following VLANs and IP addressing scheme:
     - VLAN 10: Sales (192.168.10.0/24)
     - VLAN 20: Marketing (192.168.20.0/24)
     - VLAN 30: Engineering (192.168.30.0/24)
   - Connect devices according to your diagram
   - Assign at least one PC to each VLAN

2. **Router-on-a-Stick Implementation**
   - Configure VLANs on the Layer 2 switch:
     ```
     Switch# configure terminal
     Switch(config)# vlan 10
     Switch(config-vlan)# name Sales
     Switch(config-vlan)# exit
     Switch(config)# vlan 20
     Switch(config-vlan)# name Marketing
     Switch(config-vlan)# exit
     Switch(config)# vlan 30
     Switch(config-vlan)# name Engineering
     Switch(config-vlan)# exit
     ```
   
   - Assign access ports to appropriate VLANs:
     ```
     Switch(config)# interface fastethernet 0/1
     Switch(config-if)# switchport mode access
     Switch(config-if)# switchport access vlan 10
     Switch(config-if)# exit
     
     ! Continue for other access ports
     ```
   
   - Configure the trunk link to the router:
     ```
     Switch(config)# interface gigabitethernet 0/1
     Switch(config-if)# switchport mode trunk
     Switch(config-if)# switchport trunk allowed vlan 10,20,30
     Switch(config-if)# exit
     ```
   
   - Configure router subinterfaces:
     ```
     Router# configure terminal
     
     ! Configure physical interface
     Router(config)# interface gigabitethernet 0/0
     Router(config-if)# no shutdown
     Router(config-if)# exit
     
     ! Configure subinterfaces
     Router(config)# interface gigabitethernet 0/0.10
     Router(config-subif)# encapsulation dot1q 10
     Router(config-subif)# ip address 192.168.10.1 255.255.255.0
     Router(config-subif)# exit
     
     Router(config)# interface gigabitethernet 0/0.20
     Router(config-subif)# encapsulation dot1q 20
     Router(config-subif)# ip address 192.168.20.1 255.255.255.0
     Router(config-subif)# exit
     
     Router(config)# interface gigabitethernet 0/0.30
     Router(config-subif)# encapsulation dot1q 30
     Router(config-subif)# ip address 192.168.30.1 255.255.255.0
     Router(config-subif)# exit
     ```
   
   - Configure PC IP addresses and default gateways:
     - VLAN 10 PC: IP 192.168.10.100, Gateway 192.168.10.1
     - VLAN 20 PC: IP 192.168.20.100, Gateway 192.168.20.1
     - VLAN 30 PC: IP 192.168.30.100, Gateway 192.168.30.1
   
   - Test connectivity between VLANs:
     ```
     PC-VLAN10> ping 192.168.20.100
     PC-VLAN10> ping 192.168.30.100
     ```
   
   - Implement a basic ACL to restrict traffic:
     ```
     Router(config)# access-list 101 deny ip 192.168.10.0 0.0.0.255 192.168.30.0 0.0.0.255
     Router(config)# access-list 101 permit ip any any
     
     Router(config)# interface gigabitethernet 0/0.10
     Router(config-subif)# ip access-group 101 out
     Router(config-subif)# exit
     ```
   
   - Test the ACL effectiveness:
     ```
     PC-VLAN10> ping 192.168.30.100  (should fail)
     PC-VLAN20> ping 192.168.30.100  (should succeed)
     ```

3. **Multilayer Switch Implementation**
   - Disconnect the router and connect the multilayer switch
   - Configure VLANs on the multilayer switch:
     ```
     Switch# configure terminal
     Switch(config)# vlan 10
     Switch(config-vlan)# name Sales
     Switch(config-vlan)# exit
     Switch(config)# vlan 20
     Switch(config-vlan)# name Marketing
     Switch(config-vlan)# exit
     Switch(config)# vlan 30
     Switch(config-vlan)# name Engineering
     Switch(config-vlan)# exit
     ```
   
   - Enable IP routing:
     ```
     Switch(config)# ip routing
     ```
   
   - Configure SVIs for each VLAN:
     ```
     Switch(config)# interface vlan 10
     Switch(config-if)# ip address 192.168.10.1 255.255.255.0
     Switch(config-if)# no shutdown
     Switch(config-if)# exit
     
     Switch(config)# interface vlan 20
     Switch(config-if)# ip address 192.168.20.1 255.255.255.0
     Switch(config-if)# no shutdown
     Switch(config-if)# exit
     
     Switch(config)# interface vlan 30
     Switch(config-if)# ip address 192.168.30.1 255.255.255.0
     Switch(config-if)# no shutdown
     Switch(config-if)# exit
     ```
   
   - Configure access ports:
     ```
     Switch(config)# interface fastethernet 0/1
     Switch(config-if)# switchport mode access
     Switch(config-if)# switchport access vlan 10
     Switch(config-if)# exit
     
     ! Continue for other access ports
     ```
   
   - Test connectivity between VLANs:
     ```
     PC-VLAN10> ping 192.168.20.100
     PC-VLAN10> ping 192.168.30.100
     ```
   
   - Implement a similar ACL on the multilayer switch:
     ```
     Switch(config)# ip access-list extended VLAN10-RESTRICT
     Switch(config-ext-nacl)# deny ip 192.168.10.0 0.0.0.255 192.168.30.0 0.0.0.255
     Switch(config-ext-nacl)# permit ip any any
     Switch(config-ext-nacl)# exit
     
     Switch(config)# interface vlan 10
     Switch(config-if)# ip access-group VLAN10-RESTRICT out
     Switch(config-if)# exit
     ```
   
   - Test the ACL effectiveness:
     ```
     PC-VLAN10> ping 192.168.30.100  (should fail)
     PC-VLAN20> ping 192.168.30.100  (should succeed)
     ```

4. **Performance Comparison (if equipment supports)**
   - Generate traffic between VLANs using ping with different packet sizes or file transfers
   - Compare response times and throughput between the two methods
   - Document your observations about performance differences

5. **Troubleshooting Exercise**
   - Introduce and resolve the following issues:
     - Incorrect VLAN assignment on a port
     - Missing VLAN on a trunk link
     - Incorrect IP address on a router subinterface or SVI
     - ACL configuration error
   
   - For each issue:
     - Document the symptoms
     - List the commands used to diagnose the problem
     - Explain the resolution steps
     - Verify the fix

6. **Advanced Configuration (Optional)**
   - Implement policy-based routing to direct certain traffic through specific paths
   - Configure DHCP relay to allow devices to obtain IP addresses from a DHCP server in another VLAN
   - Implement more sophisticated ACLs based on protocols and port numbers
   - Configure NAT for internet access from all VLANs

7. **Documentation and Analysis**
   - Create a comparison table of router-on-a-stick vs. multilayer switch methods, noting:
     - Ease of configuration
     - Performance characteristics
     - Scalability considerations
     - Management complexity
     - Security implementation options
   
   - Document the network configuration:
     - Physical topology
     - VLAN assignments
     - IP addressing scheme
     - Routing configuration
     - Security policies
   
   - Provide recommendations for which method would be most appropriate for:
     - A small business with 3 VLANs and 50 users
     - A medium business with 10 VLANs and 500 users
     - A large enterprise with 50 VLANs and 5000 users

**Expected Outcome:**
By completing this hands-on activity, you'll gain practical experience implementing both traditional and modern inter-VLAN routing methods. You'll understand the configuration differences, performance characteristics, and security implementation options for each approach. This knowledge will enable you to select and implement the most appropriate inter-VLAN routing solution based on specific network requirements and constraints.

**Troubleshooting Tips:**
- If inter-VLAN routing isn't working, verify that IP routing is enabled on the multilayer switch
- Check that the correct VLAN is allowed on trunk links
- Verify IP addresses and subnet masks on router subinterfaces or SVIs
- Ensure default gateways are correctly configured on end devices
- Use "debug ip packet" carefully to trace routing decisions (disable when finished)
- Remember that ACLs can block ping but allow other traffic (or vice versa)

##### Key Takeaways
- Inter-VLAN routing enables controlled communication between VLANs while maintaining the security and performance benefits of network segmentation
- Router-on-a-stick provides a simple, cost-effective solution for smaller networks with limited inter-VLAN traffic
- Multilayer switching offers superior performance and scalability for environments with higher throughput requirements
- Security implementation at routing boundaries creates control points for enforcing access policies between network segments
- Proper IP addressing design with separate subnets for each VLAN is essential for effective inter-VLAN routing
- Troubleshooting inter-VLAN routing requires understanding of both Layer 2 (switching/VLANs) and Layer 3 (routing) concepts

##### Knowledge Check
1. What is the primary limitation of the router-on-a-stick inter-VLAN routing method?
   a) It requires specialized router hardware
   b) It cannot support more than 10 VLANs
   c) All inter-VLAN traffic must traverse a single physical link
   d) It doesn't support access control between VLANs
   Answer: c) All inter-VLAN traffic must traverse a single physical link

2. In a multilayer switch implementation, what component provides the Layer 3 gateway functionality for devices in each VLAN?
   a) Routed port
   b) Switch Virtual Interface (SVI)
   c) Subinterface
   d) VLAN Trunking Protocol (VTP)
   Answer: b) Switch Virtual Interface (SVI)

3. A network administrator is designing inter-VLAN routing for a company with 15 VLANs spread across three buildings on a campus. Compare the advantages and limitations of using router-on-a-stick versus multilayer switching for this scenario, and recommend the most appropriate approach with justification.
   Answer: When designing inter-VLAN routing for a campus network with 15 VLANs across three buildings, both router-on-a-stick and multilayer switching approaches present distinct advantages and limitations that must be carefully evaluated.

   Router-on-a-stick offers simplicity and lower initial hardware costs, as it requires only a single router interface connected to a trunk port on a switch. This approach follows straightforward configuration principles that many administrators already understand, potentially reducing implementation complexity. The solution can be implemented with existing equipment if the organization already has routers with 802.1Q support, avoiding additional capital expenditure. For limited inter-VLAN traffic volumes, this approach may provide adequate performance, particularly if implemented with high-speed interfaces (10 Gbps or higher).

   However, router-on-a-stick introduces significant limitations for a multi-building campus with 15 VLANs. The most critical limitation is the single-link bottleneck—all inter-VLAN traffic must traverse one physical connection between the router and switch, creating a potential performance constraint as network utilization grows. This bottleneck becomes particularly problematic in a campus environment where inter-building traffic often requires routing between VLANs. Additionally, this approach creates a single point of failure, as any issue with the router interface or trunk link would disrupt all inter-VLAN communication. Scaling to accommodate more VLANs or increased traffic would eventually require multiple router interfaces or higher-capacity links, reducing the initial cost advantage and increasing configuration complexity.

   Multilayer switching integrates Layer 2 switching and Layer 3 routing in a single device, offering several advantages for this campus scenario. The most significant benefit is performance—multilayer switches use specialized hardware to perform routing at near-switching speeds, eliminating the external link bottleneck of router-on-a-stick implementations. This performance advantage becomes crucial in a campus environment where inter-VLAN traffic may be substantial. Multilayer switches also enhance reliability through the elimination of external routing links and the ability to implement redundant switches with protocols like HSRP or VRRP. The scalability of this approach easily accommodates 15 VLANs and provides headroom for future expansion without performance degradation. From a management perspective, consolidating switching and routing functions in a single device can simplify operations and troubleshooting.

   The primary limitations of multilayer switching include higher initial hardware costs compared to basic Layer 2 switches and potentially more complex configuration for administrators unfamiliar with integrated switching/routing devices. However, these limitations are often outweighed by the long-term benefits in campus environments.

   For this specific scenario—15 VLANs across three buildings—I strongly recommend implementing multilayer switching for the following reasons:

   1. Campus networks typically generate significant inter-VLAN traffic, particularly between buildings, which would likely exceed the practical capacity of a router-on-a-stick implementation.

   2. The multi-building topology requires reliable, high-performance routing between locations, which multilayer switches can provide through their hardware-accelerated routing capabilities.

   3. With 15 VLANs already defined and the potential for future growth, the scalability of multilayer switching provides important headroom without requiring redesign as the network evolves.

   4. The reliability benefits of multilayer switching are particularly valuable in a campus environment, where network downtime can affect multiple buildings and departments simultaneously.

   The recommended implementation would include multilayer switches in each building, configured with SVIs for all locally-required VLANs. These switches would be interconnected with high-speed links (preferably redundant) to provide inter-building connectivity. This design provides optimal performance for both intra-building and inter-building traffic while maintaining the flexibility to adapt to changing requirements. While the initial investment may be higher than a router-on-a-stick approach, the performance, reliability, and scalability benefits make multilayer switching the clearly superior choice for this campus network scenario.

##### Additional Resources
- Interactive Lab: "Advanced Inter-VLAN Routing Configurations"
- Video Series: "Troubleshooting Inter-VLAN Routing Issues"
- Reference Guide: "Inter-VLAN Security Best Practices"
- Practice Exercises: "Performance Optimization for Inter-VLAN Routing"
- Article: "Evolution of Inter-VLAN Routing in Enterprise Networks"
