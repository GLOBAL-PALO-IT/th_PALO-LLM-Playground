'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ExamplesDropDownProps {
  setInput: React.Dispatch<React.SetStateAction<string>>
}

//   const ExamplesDropDown: React.FC<ExamplesDropDownProps> = ({ setInput }) => {
const ExamplesDocsDropDown: React.FC<ExamplesDropDownProps> = ({
  setInput,
}) => {
  const handleSelectExample = (example: string) => {
    setInput(example)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 border-2 border-blue-500 bg-white text-blue-500 rounded">
          Source Documents
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 m-2 border-2 border-blue-500 rounded-lg">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Example Prompts</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => handleSelectExample("Thailand has emerged as a global hub for technical expertise and innovation, with its professionals making significant contributions across various industries worldwide. Thai experts bring a unique blend of technical proficiency, cultural intelligence, and adaptive problem-solving skills that make them highly sought after in international markets. The country's education system has evolved to produce graduates who are not only technically competent but also equipped with critical thinking abilities and multilingual capabilities. Many Thai professionals hold advanced degrees from prestigious institutions both domestically and internationally, combining world-class education with practical experience in diverse working environments. The Thai approach to professional development emphasizes continuous learning, collaboration, and the integration of traditional values with modern business practices. Thai experts are particularly renowned in fields such as technology, engineering, healthcare, hospitality management, and sustainable development. Their ability to navigate complex multicultural environments while maintaining strong ethical standards has made them invaluable assets to global organizations. The Thai professional community is characterized by strong networks and mentorship traditions, where experienced practitioners actively guide emerging talent. This culture of knowledge sharing has fostered innovation and excellence across generations. Thai experts demonstrate exceptional adaptability, having successfully contributed to projects ranging from cutting-edge technological innovations to community-based development initiatives. Their holistic approach to problem-solving often incorporates sustainability principles and social responsibility, reflecting Thailand's Buddhist-influenced values of balance and harmony. In the realm of digital transformation, Thai professionals have been at the forefront of implementing advanced technologies including artificial intelligence, blockchain, and Internet of Things solutions. The hospitality and service sectors have particularly benefited from Thai expertise, with professionals setting global standards for customer service excellence and operational efficiency. Healthcare professionals from Thailand have gained international recognition for their clinical skills, research contributions, and innovative approaches to public health challenges. Engineering experts from Thailand have contributed to infrastructure projects, renewable energy initiatives, and smart city developments across Asia and beyond. The entrepreneurial spirit among Thai professionals has led to the creation of numerous successful startups and social enterprises that address both local and global challenges. Thai experts in environmental science and sustainability have been instrumental in developing solutions for climate change adaptation, biodiversity conservation, and sustainable resource management. The creative industries have also flourished, with Thai designers, architects, and artists gaining international acclaim for their innovative work that seamlessly blends traditional aesthetics with contemporary design principles. Professional associations and industry bodies in Thailand actively promote excellence through certification programs, continuing education, and international collaboration. The government's initiatives to develop Thailand as a regional hub for various industries have further enhanced opportunities for Thai professionals to showcase their expertise on global platforms. As Thailand continues to invest in research and development, its experts are increasingly contributing to cutting-edge scientific discoveries and technological breakthroughs that benefit humanity worldwide.")}
          >
            TH Expert Bio
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSelectExample("The Global Reporting Initiative Standard 305 on Emissions, published in 2016, represents a comprehensive framework for organizations to report their greenhouse gas emissions and related environmental impacts. This standard is part of the GRI Sustainability Reporting Standards and provides detailed guidance for measuring, managing, and disclosing emissions data in a consistent and comparable manner. GRI 305 addresses direct and indirect greenhouse gas emissions, helping organizations understand and communicate their climate impact to stakeholders. The standard covers three primary scopes of emissions following the Greenhouse Gas Protocol methodology. Scope 1 includes direct emissions from sources owned or controlled by the organization, such as combustion in company vehicles or facilities. Scope 2 encompasses indirect emissions from the generation of purchased electricity, heating, cooling, and steam consumed by the organization. Scope 3 addresses all other indirect emissions occurring in the value chain, including both upstream and downstream activities. The standard requires organizations to report their emissions in metric tons of carbon dioxide equivalent, using appropriate emission factors and calculation methodologies. Organizations must disclose the gases included in their calculations, typically covering carbon dioxide, methane, nitrous oxide, hydrofluorocarbons, perfluorocarbons, sulfur hexafluoride, and nitrogen trifluoride. GRI 305 also addresses emissions intensity metrics, which help normalize emissions data relative to organizational output or activity levels. This enables meaningful comparisons across different time periods and between organizations of varying sizes. The standard includes specific disclosures for reduction initiatives, requiring organizations to report on their emissions reduction targets, strategies implemented, and results achieved. Organizations must identify the base year for emissions calculations and explain any significant changes in emissions compared to previous reporting periods. The standard emphasizes the importance of using recognized calculation tools and methodologies, such as those developed by the Intergovernmental Panel on Climate Change or the Greenhouse Gas Protocol. Boundary setting is crucial, and organizations must clearly define which operations and entities are included in their emissions inventory. GRI 305 also covers nitrogen oxides, sulfur oxides, and other significant air emissions that contribute to air quality degradation and environmental harm. The standard requires disclosure of ozone-depleting substances, recognizing their distinct environmental impact separate from climate change. Organizations reporting under GRI 305 must explain their consolidation approach for emissions, whether using equity share, financial control, or operational control methods. The standard encourages the use of third-party verification to enhance the credibility and reliability of reported emissions data. Implementation of GRI 305 helps organizations identify opportunities for energy efficiency improvements, cost savings through reduced energy consumption, and enhanced competitive positioning in markets increasingly focused on environmental performance. The standard supports compliance with various regulatory requirements and voluntary initiatives related to climate change disclosure. It facilitates participation in carbon markets and emissions trading schemes by providing robust data on organizational emissions. GRI 305 aligns with international frameworks including the Task Force on Climate-related Financial Disclosures and the Carbon Disclosure Project, enabling integrated reporting across multiple platforms. Organizations using this standard can better assess climate-related risks and opportunities, informing strategic decision-making and long-term business planning. The comprehensive nature of GRI 305 makes it an essential tool for organizations committed to transparency, accountability, and continuous improvement in environmental performance.")}>
            GRI 305_ Emissions 2016
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ExamplesDocsDropDown
