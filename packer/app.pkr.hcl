packer {
  required_plugins {
    amazon = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "subnet_id" {
  type      = string
  default   = ""
  sensitive = true
}

variable "aws_region" {
  type      = string
  default   = "us-east-1"
  sensitive = true
}

variable "ssh_username" {
  type      = string
  default   = "ec2-user"
  sensitive = true
}

variable "zip_file_path" {
  type      = string
  default   = ""
}


source "amazon-ebs" "backendApp" {
  region        = "${var.aws_region}"
  instance_type = "t2.micro"
  ami_users     = ["319887499001","211329444002"]
  
  source_ami_filter {
    filters = {
      name                = "amzn2-ami-kernel-5.10-hvm-2.*.0-x86_64-gp2"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["amazon"]
  }
  ssh_username    = "${var.ssh_username}"
  ami_name        = "backendApp-${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_description = "Amazon AMI for NEU CSYE 6225"
}

build {
  sources = [
    "source.amazon-ebs.backendApp"
  ]

  provisioner "file" {
    source      = "${var.zip_file_path}"
    destination = "/home/ec2-user/webapp.zip"
  }


  provisioner "file" {
    source = "./webapp.service"
    destination = "/tmp/webapp.service"
  }

  provisioner "shell" {
    script = "./app.sh"
  }

//   post-processor "manifest" {
//       output = "manifest.json"
//       strip_path = true
//       custom_data = {`
//         my_custom_data = "example"
//       }
//   }
}
