
# JAVA解析XML


```
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.ParserConfigurationException;



import org.w3c.dom.Element;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.w3c.dom.Node;
import org.w3c.dom.Text;

import java.io.File;
import java.io.IOException;


import org.xml.sax.SAXException;

import java.util.Scanner;

import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;//用于保存修改后的XML文件

public class jiexi 
{
	public static void showperson(Element x)
	{
		Node name=x.getElementsByTagName("name").item(0);
		System.out.println("姓名："+name.getFirstChild().getNodeValue());
		Node age=x.getElementsByTagName("age").item(0);
		System.out.println("年龄："+age.getFirstChild().getNodeValue());
		Node idcard=x.getElementsByTagName("idcard").item(0);
		System.out.println("学号："+idcard.getFirstChild().getNodeValue());
		Node school=x.getElementsByTagName("school").item(0);
		System.out.println("学校："+school.getFirstChild().getNodeValue());
	}
	public static int find(int x,String y,NodeList list,int k)
	{
		int len=list.getLength(),i,key=-1;//key用于判断是否存在信息，key=-1不存在
		String st = null;
		Node g;
		
		for(i=0;i<len;i++)
		{
			Element t=(Element)list.item(i);
			switch(x)
			{
			case 1:
				g=t.getElementsByTagName("name").item(0);
				st=g.getFirstChild().getNodeValue();
				break;
			case 2:
				g=t.getElementsByTagName("age").item(0);
				st=g.getFirstChild().getNodeValue();
				break;
			case 3:
				g=t.getElementsByTagName("school").item(0);
				st=g.getFirstChild().getNodeValue();				
				break;
			case 4:
				g=t.getElementsByTagName("idcard").item(0);
				st=g.getFirstChild().getNodeValue();
			}
			if(st.compareToIgnoreCase(y)==0)
			{
				if(k==1)
				{
					showperson(t);
				}
				key=i;
			}
		}
		return key;
	}
	public static void show(NodeList x)
	{
		int i,len=x.getLength();
		for(i=0;i<len;i++)
		{
			Element s=(Element)x.item(i);
			showperson(s);
		}
	}
	public static void add(String x[],Document w)
	{
		Element student=w.createElement("student");//创建元素节点
		Element name=w.createElement("name");
		Element age=w.createElement("age");
		Element school=w.createElement("school");
		Element idcard=w.createElement("idcard");
			
		Text namez=w.createTextNode(x[1]);//创建文本节点
		Text schoolz=w.createTextNode(x[2]);
		Text agez=w.createTextNode(x[3]);
		Text idcardz=w.createTextNode(x[0]);
			
		name.appendChild(namez);//添加为对应节点的子节点
		age.appendChild(agez);
		school.appendChild(schoolz);
		idcard.appendChild(idcardz);
		
		student.appendChild(name);
		student.appendChild(age);
		student.appendChild(school);
		student.appendChild(idcard);
			
		Element root=w.getDocumentElement();//获取根节点
			
		root.appendChild(student);
		System.out.println("添加学生信息成功！");
			
	}
	public static void del(String id,NodeList k)
	{
		int m=find(4,id,k,0);//要删除的节点位置
		Node p=k.item(m);//要删除的节点
		p.getParentNode().removeChild(p);//通过父节点删除子节点
		System.out.println("删除学生信息成功！");
	}
	public static void change(String id,int chan,NodeList k,String e)
	{
		String j=new String();
		int m=0;
		switch(chan)
		{
		case 1:
			j="name";
			break;
		case 2:
			j="age";
			break;
		case 3:
			j="school";
			break;
		case 4:
			j="idcard";
			if(find(4,e,k,0)>=0)
			{
				System.out.println("已存在该学号，不能修改！");
				m=1;
			}
			break;
		default:
			System.out.println("输入类别错误！");
			m=1;
		}
		if(m==0)
		{
			m=find(4,id,k,0);//要修改节点位置
			Element p=(Element)k.item(m);//要修改的元素，由节点强制强制转换而来，不然没有修改方法
			Node f=p.getElementsByTagName(j).item(0);//获得要修改的节点
			f.getFirstChild().setNodeValue(e);//修改节点
			System.out.println("修改成功!");
		}
	}
	public static void main(String[] args) 
	{
		DocumentBuilderFactory t=DocumentBuilderFactory.newInstance();
		try
		{
			DocumentBuilder p=t.newDocumentBuilder();
			File r=new File("e://my.xml");
			Document q=p.parse(r);
			NodeList g=q.getElementsByTagName("student");
			Scanner k=new Scanner(System.in);
			int m;
			String str[]=new String[4];
			while(true)
			{
				System.out.println("请选择功能：1、查看所有信息   2、查找信息   3、增加信息  4、删除信息  5、修改信息  6、保存文件" );
				m=k.nextInt();
				switch(m)
				{
				case 1:
					show(g);//显示全部
					break;
				case 2:
					System.out.println("请选择查找类别：1、姓名   2、年龄  3、学校  4、学号");
					m=k.nextInt();
					System.out.println("请输入查找内容：");
					str[0]=k.next();
					System.out.println("查找到的信息为：");
					if(find(m,str[0],g,1)==-1)//查找
					{
						System.out.println("不存在相关信息！");
					}
					break;
				case 3://添加学生信息
					System.out.println("请输入学号（不可重复）：");
					str[0]=k.next();
					if(find(4,str[0],g,0)<0)
					{
						System.out.println("请输入姓名：");
						str[1]=k.next();
						System.out.println("请输入年龄：");
						str[2]=k.next();
						System.out.println("请输入学校：");
						str[3]=k.next();
						add(str,q);
					}
					else
					{
						System.out.println("已存在该学号，不能添加信息！");
					}
					break;
				case 4://删除信息
					System.out.println("请输入要删除的学生学号：");
					str[0]=k.next();
					if(find(m,str[0],g,0)==-1)//查找
					{
						System.out.println("不存在要删除学号！");
					}
					else
					{
						del(str[0],g);
					}
					break;
				case 5://修改信息
					System.out.println("请输入要修改的学生的学号：");
					str[0]=k.next();
					System.out.println("请输入要修改的类别：1、姓名 2、年龄 3、学校 4、学号");
					m=k.nextInt();
					System.out.println("请输入内容：");
					str[1]=k.next();
					change(str[0],m,g,str[1]);
					break;
				case 6://保存文件
					DOMSource a=new DOMSource(q);//转换输入源
					StreamResult c=new StreamResult(new File("e://save.xml"));//保存位置
					TransformerFactory o=TransformerFactory.newInstance();
					Transformer n=o.newTransformer();
					n.transform(a, c);
					System.out.println("保存成功！保存在：e://save.xml");
					break;
				default:
					System.out.println("输入类别错误！");
				}
			}	
		}
		catch(ParserConfigurationException e){e.printStackTrace();}
		catch(IOException e){e.printStackTrace();}
		catch(SAXException e){e.printStackTrace();}
		catch(TransformerConfigurationException e){e.printStackTrace();}
		catch(TransformerException e){e.printStackTrace();}
	}
}
```


XML内容为：
```
<?xml version="1.0" encoding="utf-8"?>
<students>
<student >
<name >李权真</name>
<age>21</age>
<school>北方民族大学</school>
<idcard>001</idcard>
</student>
<student>
<name>吴兵</name>
<age>20</age>
<school>北方民族大学</school>
<idcard>002</idcard>
</student>
<student>
<name>李飘</name>
<age>20</age>
<school>北方民族大学</school>
<idcard>003</idcard>
</student>
<student>
<name>小刚</name>
<age>19</age>
<school>西北工业大学</school>
<idcard>004</idcard>
</student>
<student>
<name>小红</name>
<age>18</age>
<school>清华大学</school>
<idcard>005</idcard>
</student>
<student>
<name>陈宇</name>
<age>23</age>
<school>北京大学</school>
<idcard>006</idcard>
</student>
</students>

```
