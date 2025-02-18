import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css"; 
import CopyIcon from "../../assets/icons/copyWhite.svg";
import { toast } from "react-toastify";
import { Typography } from "@mui/material";

const App = () => {
  const content = `# Object-Oriented Programming (OOP) in PHP
  # GFM

## Autolink literals

www.example.com, https://example.com, and contact@example.com.

## Footnote

A note[^1]

[^1]: Big note.

## Strikethrough

~one~ or ~~two~~ tildes.

## Table

| a | b  |  c |  d  |
| - | :- | -: | :-: |

## Tasklist

* [ ] to do
* [x] done

  $F = ma$

  This is ==highlighted text==.

  This is __underlined text__.
  
**Overview**:  
Object-Oriented Programming (OOP) is a programming paradigm that uses "objects" to design applications. In PHP, OOP allows developers to create reusable code, organize complex programs, and model real-world entities.

## Key Components of OOP

1. **Classes**:
   - A class is a blueprint for creating objects. It defines properties (attributes) and methods (functions) that the objects created from the class will have.
   - Example:
     \`\`\`php
     class Car {
         public $color;
         public $model;

         public function __construct($color, $model) {
             $this->color = $color;
             $this->model = $model;
         }

         public function displayInfo() {
             return "Car model: $this->model, Color: $this->color";
         }
     }
     \`\`\`

2. **Objects**:
   - An object is an instance of a class. It contains the properties and methods defined in the class.
   - Example:
     \`\`\`php
     $myCar = new Car("Red", "Toyota");
     echo $myCar->displayInfo(); // Outputs: Car model: Toyota, Color: Red
     \`\`\`

3. **Inheritance**:
   - Inheritance allows a class (child class) to inherit properties and methods from another class (parent class). This promotes code reusability.
   - Example:
     \`\`\`php
     class ElectricCar extends Car {
         public $batteryLife;

         public function __construct($color, $model, $batteryLife) {
             parent::__construct($color, $model);
             $this->batteryLife = $batteryLife;
         }

         public function displayBatteryLife() {
             return "Battery life: $this->batteryLife hours";
         }
     }

     $myElectricCar = new ElectricCar("Blue", "Tesla", 24);
     echo $myElectricCar->displayInfo(); // Outputs: Car model: Tesla, Color: Blue
     echo $myElectricCar->displayBatteryLife(); // Outputs: Battery life: 24 hours
     \`\`\`

4. **Encapsulation**:
   - Encapsulation is the concept of restricting access to certain properties and methods of an object. This is done using visibility keywords: \`public\`, \`protected\`, and \`private\`.
   - Example:
     \`\`\`php
     class BankAccount {
         private $balance;

         public function __construct($initialBalance) {
             $this->balance = $initialBalance;
         }

         public function deposit($amount) {
             $this->balance += $amount;
         }

         public function getBalance() {
             return $this->balance;
         }
     }

     $account = new BankAccount(100);
     $account->deposit(50);
     echo $account->getBalance(); // Outputs: 150
     \`\`\`

5. **Polymorphism**:
   - Polymorphism allows methods to do different things based on the object that it is acting upon. This can be achieved through method overriding and interfaces.
   - Example:
     \`\`\`php
     class Animal {
         public function sound() {
             return "Some sound";
         }
     }

     class Dog extends Animal {
         public function sound() {
             return "Bark";
         }
     }

     class Cat extends Animal {
         public function sound() {
             return "Meow";
         }
     }

     $dog = new Dog();
     $cat = new Cat();
     echo $dog->sound(); // Outputs: Bark
     echo $cat->sound(); // Outputs: Meow
     \`\`\`

## Applications of OOP in PHP

- **Web Development**: OOP is widely used in frameworks like Laravel and Symfony to build scalable web applications.
- **Content Management Systems**: Platforms like WordPress and Drupal utilize OOP principles for better organization and extensibility.
- **APIs**: OOP helps in structuring APIs, making them easier to maintain and extend.

## Key Takeaways

- OOP in PHP promotes code reusability, organization, and scalability.
- KeyKey concepts include **classes**, **objects**, **inheritance**, **encapsulation**, and **polymorphism**.
- OOP is essential for modern PHP development, especially in frameworks and large applications.

If you have any further questions or need clarification on any specific aspect of OOP in PHP, feel free to ask!`;


  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
        toast.success("Code copied to clipboard!");
    });
  };

  return (
      <Typography sx={{textAlign: 'center', fontSize: '4rem', fontWeight: 700, p: 4}}>Comming Soon</Typography>
    // <ReactMarkdown 
    //   children={content} 
    //   remarkPlugins={[remarkGfm, remarkMath]} 
    //   rehypePlugins={[rehypeKatex]} 
    //   components={{
    //     h1: ({ children }) => <h1 style={{color: '#000BAB'}}>{children}</h1>,
    //     h2: ({ children }) => <h2 style={{color: '#000BAB'}}>{children}</h2>,
    //     h3: ({ children }) => <h3 style={{color: '#000BAB'}}>{children}</h3>,
    //     h4: ({ children }) => <h4 style={{color: '#000BAB'}}>{children}</h4>,
    //     h5: ({ children }) => <h5 style={{color: '#000BAB'}}>{children}</h5>,
    //     h6: ({ children }) => <h6 style={{color: '#000BAB'}}>{children}</h6>,
    //     strong: ({ children }) => <strong style={{color: '#000BAB'}}>{children}</strong>,
    //     table: ({ children }) => <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", border: "1px solid black" }}>{children}</table>,
    //     th: ({ children }) => <th style={{ border: "1px solid black", padding: "8px", background: "#f5f5f5" }}>{children}</th>,
    //     td: ({ children }) => <td style={{ border: "1px solid black", padding: "8px" }}>{children}</td>,
    //     mark: ({ children }) => <mark style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>{children}</mark>,
    //     code({ inline, className, children, ...props }) {
    //       const match = /language-(\w+)/.exec(className || "");
    //       const codeString = String(children).replace(/\n$/, "");

    //       return inline ? (
    //         <code
    //           {...props}
    //           style={{
    //             background: "#eee",
    //             padding: "3px",
    //             borderRadius: "4px",
    //           }}
    //         >
    //           {children}
    //         </code>
    //       ) : (
    //         <div
    //           className="codeBlockMainWrap"
    //           style={{
    //             width: "100%",
    //             margin: "auto",
    //             borderRadius: "10px",
    //             border: "1px solid grey",
    //             background: '#2f2f2f',
    //             padding: "40px 0 0 0",
    //             position: "relative",
    //             overflow: 'hidden'
    //           }}
    //         >
    //           <div
    //             style={{
    //               position: "absolute",
    //               top: "5px",
    //               right: "10px",
    //               color: "#fff",
    //               padding: "5px",
    //               borderRadius: "50%",
    //               cursor: "pointer",
    //               display: 'flex',
    //               justifyContent: 'center',
    //               alignItems: 'center',
    //               fontSize: '14px',
    //               fontWeight: 300
    //             }}
    //             onClick={() => copyToClipboard(codeString)}
    //           >
    //             <img src={CopyIcon} style={{width: '18px', height: 'auto'}} /> Copy
    //           </div>
    //           <SyntaxHighlighter
    //             style={vscDarkPlus}
    //             language={match ? match[1] : "plaintext"}
    //             {...props}
    //           >
    //             {codeString}
    //           </SyntaxHighlighter>
    //         </div>
    //       );
    //     },    
    //   }}
    // />
  );
};

export default App;
